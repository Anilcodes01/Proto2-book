import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile, chmod, access, constants, stat } from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const runtime = 'edge';

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

  // Image loading and data URI creation REMOVED

  let assembledHtml = '';

  // Front Matter Logic (remains the same)
  if (frontMatter && frontMatter.length > 0) {
    frontMatter.forEach((item, index) => {
      assembledHtml += `<div class="front-matter-item">\n`;
      assembledHtml += `<h2 class="front-matter-title" style="text-align: center; margin-top: 2em; margin-bottom: 1em;">${item.name}</h2>\n`;
      assembledHtml += `<div class="front-matter-content">${item.content || '<p><i>[No content provided]</i></p>'}</div>\n`;
      assembledHtml += `</div>\n`;
      assembledHtml += '<div style="page-break-after: always;"></div>\n';
    });
  }

  // Chapters and Parts Logic (Image part removed)
  chapters.forEach((chapter, chapterIndex) => {
    assembledHtml += `<div class="chapter-item">\n`;
    // Chapter Title
    assembledHtml += `<h1 class="chapter-title" style="text-align: center; page-break-before: auto; margin-bottom: 0.5em;">${chapter.name}</h1>\n`;

    // Hardcoded image insertion REMOVED

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

  // End Matter Logic (remains the same)
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
    const payload = await req.json() as GeneratePreviewPayload;
    const {
        style = 'classic',
        bookTitle = 'Document',
        frontMatter = [],
        chapters = [],
        endMatter = []
    } = payload;

    if (frontMatter.length === 0 && chapters.length === 0 && endMatter.length === 0) {
        return NextResponse.json({ error: 'No content provided (Front Matter, Chapters, or End Matter)' }, { status: 400 });
    }

    const validStyles = ['classic', 'minimalist', 'modern'];
    const selectedStyle = validStyles.includes(style) ? style : 'minimalist';

    const assembledHtml = await assembleHtmlContent(frontMatter, chapters, endMatter); // Await the async function
    const template = await getTemplate(selectedStyle);

    const titlePlaceholder = '{{title}}';
    const contentPlaceholder = '{{{content}}}';
    let finalHtml = template.replace(titlePlaceholder, bookTitle);

    if (!template.includes(contentPlaceholder)) {
      throw new Error(`Template '${selectedStyle}' is invalid.`);
    }
    finalHtml = finalHtml.replace(contentPlaceholder, assembledHtml);

    tempFinalHtmlPath = path.join(tmpdir(), `${randomUUID()}-final.html`);
    await writeFile(tempFinalHtmlPath, finalHtml);
    const stats = await stat(tempFinalHtmlPath);
    console.log(`Final HTML written to: ${tempFinalHtmlPath}, Size: ${stats.size} bytes`);

    let executablePath;

    if (process.env.CHROME_EXECUTABLE_PATH) {
      executablePath = process.env.CHROME_EXECUTABLE_PATH;
      console.log("Using CHROME_EXECUTABLE_PATH from environment:", executablePath);
    }
    else if (process.arch === 'arm64' && process.platform === 'darwin') {
      const macOSChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      try {
        await access(macOSChromePath, constants.X_OK);
        executablePath = macOSChromePath;
        console.log("Using system Chrome on macOS:", executablePath);
      } catch (e) {
        console.log("System Chrome not found or not accessible, falling back to @sparticuz/chromium");
      }
    }

    if (!executablePath) {
      try {
        console.log("Attempting to get executable path from @sparticuz/chromium...");
        executablePath = await chromium.executablePath();
         if (!executablePath || typeof executablePath !== 'string' || executablePath.length < 2) {
            throw new Error(`@sparticuz/chromium returned an invalid path: ${executablePath}`);
          }
        console.log("Using @sparticuz/chromium executable:", executablePath);
      } catch (e: any) {
        console.error("Failed to get Chromium executable path from @sparticuz/chromium:", e.message);
        throw new Error("Failed to determine Chromium executable path.");
      }
    }

    try {
      console.log(`Checking access for executable: ${executablePath}`);
      await access(executablePath, constants.X_OK);
      console.log("Executable exists and is executable.");
    } catch (accessError) {
      console.warn(`Executable not accessible at ${executablePath}, attempting to chmod...`, accessError);
      try {
        await chmod(executablePath, 0o755);
        await access(executablePath, constants.X_OK);
        console.log("Executable permissions set successfully and verified.");
      } catch (chmodOrAccessError) {
        console.error("Failed to set/verify executable permissions:", chmodOrAccessError);
        throw new Error(`Chromium executable not found or not executable at: ${executablePath}. Error: ${chmodOrAccessError}`);
      }
    }

    const standardArgs = [
        '--headless=new',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
    ];
    console.log("Launching Puppeteer with standard args:", standardArgs);
    browser = await puppeteer.launch({
      executablePath,
      args: standardArgs,
      headless: true,
      dumpio: true
    });
    console.log("Puppeteer launched.");

    const page = await browser.newPage();
    console.log("New page created.");
    await page.setViewport({ width: 1200, height: 1600 });

    tempPdfPath = path.join(tmpdir(), `${randomUUID()}.pdf`);
    console.log(`Generating PDF from HTML file: ${tempFinalHtmlPath}`);
    console.log(`Output PDF path: ${tempPdfPath}`);

    const fileUrl = `file://${tempFinalHtmlPath}`;
    console.log(`Navigating page to: ${fileUrl}`);
    await page.goto(fileUrl, {
        waitUntil: 'load',
        timeout: 90000
    });
    console.log("Page navigation complete.");

    await page.pdf({
      path: tempPdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' },
      timeout: 60000,
      preferCSSPageSize: true, // Better for serverless
      scale: 0.8 // Reduce slightly to save processing
    });
    console.log("PDF generation attempted.");

    console.log("Closing browser.");
    await browser.close();
    browser = null;

    console.log("Uploading PDF to Cloudinary...");
    const uploadRes = await cloudinary.uploader.upload(tempPdfPath, {
      resource_type: 'raw',
      folder: 'books-pdf-previews',
      public_id: `preview-${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${randomUUID().substring(0, 8)}`,
    });
    console.log("Cloudinary upload successful:", uploadRes.secure_url);

    return NextResponse.json({ pdfUrl: uploadRes.secure_url });

  } catch (error: any) {
    console.error('Error during PDF generation process:', error);
    if (error.message) console.error('Error Message:', error.message);
    if (error.stack) console.error('Error Stack:', error.stack);

    return NextResponse.json({
        error: 'Failed to generate PDF preview',
        details: error.message || 'An unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });

  } finally {
    if (browser) {
      try {
        console.log("Closing browser in finally block (if still open)...");
        await browser.close().catch(e => console.warn("Error closing browser:", e.message));
        console.log("Browser closed in finally block.");
      } catch (closeError: any) {
        console.error("Error closing browser in finally:", closeError.message);
      }
    }

    const cleanupFiles = [
      { path: tempFinalHtmlPath, label: 'Final HTML' },
      { path: tempPdfPath, label: 'PDF' }
    ];
    for (const file of cleanupFiles) {
      if (file.path) {
        try {
          await access(file.path);
          await unlink(file.path);
          console.log(`Cleaned up temp file: ${file.label}`);
        } catch (cleanupError: any) {
          if (cleanupError.code !== 'ENOENT') {
            console.warn(`Failed to cleanup temp ${file.label} file: ${cleanupError.message}`);
          }
        }
      }
    }
  }
}