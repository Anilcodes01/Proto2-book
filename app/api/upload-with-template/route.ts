import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile } from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import { v2 as cloudinary } from 'cloudinary';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getTemplate(templateName: string): Promise<string> {
  const templatePath = path.join(process.cwd(), 'public', 'templates', `${templateName}.hbs`);
  const templateBuffer = await readFile(templatePath);
  return templateBuffer.toString('utf-8');
}

export async function POST(req: NextRequest) {
  let tempDocxPath: string | null = null;
  let tempRawHtmlPath: string | null = null;
  let tempFinalHtmlPath: string | null = null;
  let tempPdfPath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const style = formData.get('style') as string | null || 'classic';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validStyles = ['classic', 'minimalist', 'modern'];
    if (!validStyles.includes(style)) {
      return NextResponse.json({ error: 'Invalid style specified' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    tempDocxPath = path.join(tmpdir(), `${randomUUID()}-${file.name || 'document.docx'}`);
    await writeFile(tempDocxPath, fileBuffer);

    const result = await mammoth.convertToHtml({ path: tempDocxPath });
    const htmlContent = result.value;
    tempRawHtmlPath = path.join(tmpdir(), `${randomUUID()}-raw.html`);
    await writeFile(tempRawHtmlPath, htmlContent);

    const template = await getTemplate(style);
    const titlePlaceholder = '{{title}}';
    const contentPlaceholder = '{{{content}}}';
    const title = file.name?.replace(/\.docx$/i, '') || 'Document';

    let finalHtml = template.replace(titlePlaceholder, title);
    if (!finalHtml.includes(contentPlaceholder)) {
      throw new Error(`Template is missing the '${contentPlaceholder}' placeholder.`);
    }
    finalHtml = finalHtml.replace(contentPlaceholder, htmlContent);

    tempFinalHtmlPath = path.join(tmpdir(), `${randomUUID()}-final.html`);
    await writeFile(tempFinalHtmlPath, finalHtml);

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(`file://${tempFinalHtmlPath}`, { waitUntil: 'networkidle0', timeout: 60000 });
    
    tempPdfPath = path.join(tmpdir(), `${randomUUID()}.pdf`);
    await page.pdf({
      path: tempPdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' }
    });
    
    await browser.close();

    const uploadRes = await cloudinary.uploader.upload(tempPdfPath, {
      resource_type: 'raw',
      folder: 'books-pdf',
      public_id: path.parse(file.name || randomUUID()).name,
    });

    return NextResponse.json(uploadRes.secure_url);

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Failed to process file',
      details: error.stack 
    }, { status: 500 });
  } finally {
    const cleanupFiles = [
      { path: tempDocxPath, label: 'DOCX' },
      { path: tempRawHtmlPath, label: 'Raw HTML' },
      { path: tempFinalHtmlPath, label: 'Final HTML' },
      { path: tempPdfPath, label: 'PDF' }
    ];

    for (const file of cleanupFiles) {
      if (file.path) {
        try {
          await unlink(file.path);
        } catch (cleanupError) {}
      }
    }
  }
}