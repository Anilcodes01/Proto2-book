import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile, access, constants } from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Set runtime to nodejs
export const runtime = 'nodejs';
// Set max duration (for Vercel Pro/Enterprise)
export const maxDuration = 60;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface GeneratePreviewPayload {
  style?: string;
  bookTitle: string;
  frontMatter: Array<{ id: string; name: string; content: string; }>;
  chapters: Array<{ id: string; name: string; content: string; parts: Array<{ id: string; name: string; content: string; }>; }>;
  endMatter: Array<{ id: string; name: string; content: string; }>;
}

async function getTemplate(templateName: string): Promise<string> {
  const templatePath = path.join(process.cwd(), 'public', 'templates', `${templateName}.hbs`);
  try {
    const templateBuffer = await readFile(templatePath);
    return templateBuffer.toString('utf-8');
  } catch (err) {
    console.error(`Error reading template ${templateName}:`, err);
    throw new Error(`Template file not found or unreadable: ${templateName}.hbs`);
  }
}

function assembleHtmlContent(
  frontMatter: GeneratePreviewPayload['frontMatter'],
  chapters: GeneratePreviewPayload['chapters'],
  endMatter: GeneratePreviewPayload['endMatter']
): string {
  let assembledHtml = '';

  // Front Matter Logic
  if (frontMatter && frontMatter.length > 0) {
    frontMatter.forEach((item) => {
      assembledHtml += `<div class="front-matter-item">\n`;
      assembledHtml += `<h2 class="front-matter-title" style="text-align: center; margin-top: 2em; margin-bottom: 1em;">${item.name}</h2>\n`;
      assembledHtml += `<div class="front-matter-content">${item.content || '<p><i>[No content provided]</i></p>'}</div>\n`;
      assembledHtml += `</div>\n`;
      assembledHtml += '<div style="page-break-after: always;"></div>\n';
    });
  }

  // Chapters and Parts Logic
  chapters.forEach((chapter, chapterIndex) => {
    assembledHtml += `<div class="chapter-item">\n`;
    // Chapter Title
    assembledHtml += `<h1 class="chapter-title" style="text-align: center; page-break-before: auto; margin-bottom: 0.5em;">${chapter.name}</h1>\n`;
    // Chapter Content
    assembledHtml += `<div class="chapter-content">${chapter.content || ''}</div>\n`;

    // Parts
    if (chapter.parts && chapter.parts.length > 0) {
      chapter.parts.forEach((part) => {
        assembledHtml += `<div class="part-item" style="margin-top: 1.5em;">\n`;
        assembledHtml += `<h2 class="part-title" style="text-align: center; margin-bottom: 0.5em;">${part.name}</h2>\n`;
        assembledHtml += `<div class="part-content">${part.content || '<p><i>[No content for this part]</i></p>'}</div>\n`;
        assembledHtml += `</div>\n`;
      });
    }
    assembledHtml += `</div>\n`; // Close chapter-item

    // Page Break Logic
    if (chapterIndex < chapters.length - 1 || (endMatter && endMatter.length > 0)) {
       assembledHtml += '<div style="page-break-after: always;"></div>\n';
    }
  });

  // End Matter Logic
  if (endMatter && endMatter.length > 0) {
    endMatter.forEach((item, index) => {
      assembledHtml += `<div class="end-matter-item">\n`;
      assembledHtml += `<h2 class="end-matter-title" style="text-align: center; margin-top: 2em; margin-bottom: 1em;">${item.name}</h2>\n`;
      assembledHtml += `<div class="end-matter-content">${item.content || '<p><i>[No content provided]</i></p>'}</div>\n`;
      assembledHtml += `</div>\n`;
      if (index < endMatter.length - 1) {
        assembledHtml += '<div style="page-break-after: always;"></div>\n';
      }
    });
  }

  return assembledHtml;
}

export async function POST(req: NextRequest) {
  let tempFinalHtmlPath: string | null = null;
  let tempPdfPath: string | null = null;
  let browser = null;

  try {
    // Parse the request JSON
    const payload = await req.json() as GeneratePreviewPayload;
    const {
      style = 'classic',
      bookTitle = 'Document',
      frontMatter = [],
      chapters = [],
      endMatter = []
    } = payload;

    // Basic validation
    if (frontMatter.length === 0 && chapters.length === 0 && endMatter.length === 0) {
      return NextResponse.json({ error: 'No content provided (Front Matter, Chapters, or End Matter)' }, { status: 400 });
    }

    // Validate style
    const validStyles = ['classic', 'minimalist', 'modern'];
    const selectedStyle = validStyles.includes(style) ? style : 'minimalist';

    // Generate HTML content
    const assembledHtml = assembleHtmlContent(frontMatter, chapters, endMatter);
    const template = await getTemplate(selectedStyle);

    // Apply template
    const titlePlaceholder = '{{title}}';
    const contentPlaceholder = '{{{content}}}';
    
    let finalHtml = template.replace(titlePlaceholder, bookTitle);
    if (!template.includes(contentPlaceholder)) {
      throw new Error(`Template '${selectedStyle}' is invalid.`);
    }
    finalHtml = finalHtml.replace(contentPlaceholder, assembledHtml);

    // Write HTML to temp file
    tempFinalHtmlPath = path.join(tmpdir(), `${randomUUID()}-final.html`);
    await writeFile(tempFinalHtmlPath, finalHtml);

    // Initialize Puppeteer with simplified configuration
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath(),
      headless: true,
    });

    // Create page and set viewport
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600 });

    // Generate PDF
    tempPdfPath = path.join(tmpdir(), `${randomUUID()}.pdf`);
    
    // Navigate to HTML file
    await page.goto(`file://${tempFinalHtmlPath}`, { 
      waitUntil: 'load',
      timeout: 30000 // Reduced timeout
    });

    // Generate PDF with optimized settings
    await page.pdf({
      path: tempPdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' },
      timeout: 30000, // Reduced timeout
      preferCSSPageSize: true,
      scale: 0.8 // Reduces resource usage
    });

    await browser.close();
    browser = null;

    // Upload to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(tempPdfPath, {
      resource_type: 'raw',
      folder: 'books-pdf-previews',
      public_id: `preview-${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${randomUUID().substring(0, 8)}`,
    });

    return NextResponse.json({ pdfUrl: uploadRes.secure_url });

  } catch (error: any) {
    console.error('Error during PDF generation:', error.message);
    
    return NextResponse.json({
      error: 'Failed to generate PDF preview',
      details: error.message || 'An unknown error occurred'
    }, { status: 500 });

  } finally {
    // Close browser if still open
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore browser close errors
      }
    }

    // Clean up temp files
    const cleanupFiles = [
      { path: tempFinalHtmlPath, label: 'Final HTML' },
      { path: tempPdfPath, label: 'PDF' }
    ];
    
    for (const file of cleanupFiles) {
      if (file.path) {
        try {
          await unlink(file.path);
        } catch (e) {
          // Ignore file cleanup errors
        }
      }
    }
  }
}