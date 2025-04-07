import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises'; 
import path from 'path';
import mammoth from 'mammoth';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import puppeteer from 'puppeteer-core'; 
import chromium from '@sparticuz/chromium'; 

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  let tempDocxPath: string | null = null;
  let tempHtmlPath: string | null = null;
  let tempPdfPath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    tempDocxPath = path.join(tmpdir(), `${randomUUID()}-${file.name || 'document.docx'}`);
    await writeFile(tempDocxPath, fileBuffer);

    const { value: htmlContent } = await mammoth.convertToHtml({ path: tempDocxPath });

    tempHtmlPath = path.join(tmpdir(), `${randomUUID()}.html`);
    await writeFile(
      tempHtmlPath,
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${file.name || 'Document'}</title>
          <style>
            body { font-family: sans-serif; margin: 2cm; }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>`
    );

    // Configure Chromium for Vercel
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });
    tempPdfPath = path.join(tmpdir(), `${randomUUID()}.pdf`);
    await page.pdf({ 
      path: tempPdfPath, 
      format: 'A4', 
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    }); 
    await browser.close();

    const uploadRes = await cloudinary.uploader.upload(tempPdfPath, {
      resource_type: 'raw',
      folder: 'books-pdf', 
      public_id: path.parse(file.name || randomUUID()).name, 
    });

    const title = file.name?.replace(/\.docx$/i, '') || 'Untitled Book'; 
    const doc = uploadRes.secure_url

    return NextResponse.json(doc);

  } catch (error: any) {
    console.error('Error processing file upload:', error);
    let errorMessage = 'Failed to process file';
    if (error.message?.includes('mammoth')) {
        errorMessage = 'Failed to convert DOCX file.';
    } else if (error.message?.includes('puppeteer') || error.message?.includes('Page crashed')) {
        errorMessage = 'Failed to generate PDF.';
    } else if (error.message?.includes('Cloudinary')) {
        errorMessage = 'Failed to upload PDF to Cloudinary.';
    }

    return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });

  } finally {
    // Cleanup code remains the same
    try {
      if (tempDocxPath) await unlink(tempDocxPath);
    } catch (cleanupError) {
      console.error('Failed to delete temp DOCX:', tempDocxPath, cleanupError);
    }
    try {
      if (tempHtmlPath) await unlink(tempHtmlPath);
    } catch (cleanupError) {
      console.error('Failed to delete temp HTML:', tempHtmlPath, cleanupError);
    }
    try {
      if (tempPdfPath) await unlink(tempPdfPath);
    } catch (cleanupError) {
      console.error('Failed to delete temp PDF:', tempPdfPath, cleanupError);
    }
  }
}