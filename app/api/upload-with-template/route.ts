import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, readFile } from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import { v2 as cloudinary } from 'cloudinary';
// Remove PrismaClient if not used in this specific route
// import { PrismaClient } from '@prisma/client';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';

// const prisma = new PrismaClient(); // Remove if not needed here

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

async function getTemplate(templateName: string): Promise<string> {
  const templatePath = path.join(process.cwd(), 'public', 'templates', `${templateName}.hbs`);
  console.log(`Attempting to read template from: ${templatePath}`);
  try {
    // Read as a buffer first
    const templateBuffer = await fs.readFile(templatePath);
    // Convert buffer to string using utf-8
    const templateContent = templateBuffer.toString('utf-8');

    console.log(`Successfully read template: ${templateName}.hbs (Buffer Length: ${templateBuffer.length}, String Length: ${templateContent.length})`);

    // --- DETAILED CHARACTER DEBUGGING ---
    const targetPlaceholder = '{{{content}}}';
    const placeholderIndex = templateContent.indexOf(targetPlaceholder);

    if (placeholderIndex === -1) {
        console.warn(`WARNING: String.indexOf could NOT find "${targetPlaceholder}" in the template content.`);

        // Log the section where it *should* be (adjust indices as needed)
        const searchStartIndex = templateContent.indexOf('<body>'); // Find start of body
        if (searchStartIndex !== -1) {
            const searchEndIndex = searchStartIndex + 200; // Log 200 chars after <body>
            const bodySnippet = templateContent.substring(searchStartIndex, searchEndIndex);
            console.log("Snippet near expected location (after <body>):");
            console.log(bodySnippet);

            // Log character codes around the expected location
            console.log("Character codes around expected location:");
            let charCodes = '';
            const startCharCodeIndex = Math.max(0, bodySnippet.indexOf('body>') + 5); // Start after <body> tag close approx
            const endCharCodeIndex = Math.min(bodySnippet.length, startCharCodeIndex + 30); // Log 30 char codes
            for (let i = startCharCodeIndex; i < endCharCodeIndex; i++) {
                charCodes += `${bodySnippet.charCodeAt(i)} (${bodySnippet[i]}) `;
            }
            console.log(charCodes);

            // Specifically look for '{' character codes (123)
             console.log("Searching for '{' (char code 123) occurrences in snippet:");
             for (let i = startCharCodeIndex; i < endCharCodeIndex; i++) {
                if(bodySnippet.charCodeAt(i) === 123) {
                    console.log(`Found '{' at index ${i} in snippet.`);
                }
             }

        } else {
             console.warn("Could not find '<body>' tag in template snippet for detailed logging.");
             console.log("First 500 chars of template:", templateContent.substring(0, 500));
        }

    } else {
         console.log(`String.indexOf FOUND "${targetPlaceholder}" at index: ${placeholderIndex}`);
    }
    // --- END DETAILED CHARACTER DEBUGGING ---


    // Keep the original includes check for the actual logic/warning
    if (!templateContent.includes(targetPlaceholder)) {
        console.warn(`(Confirmation) WARNING: String.includes check also failed for "${targetPlaceholder}".`);
    }


    return templateContent;
  } catch (error) {
    console.error(`Failed to read template: ${templateName}.hbs`, error);
    throw new Error(`Could not load template: ${templateName}.hbs`);
  }
}

export async function POST(req: NextRequest) {
  let tempDocxPath: string | null = null;
  let tempRawHtmlPath: string | null = null; // To save raw mammoth output
  let tempFinalHtmlPath: string | null = null;
  let tempPdfPath: string | null = null;

  console.log("--- New Request ---"); // Log start of request

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const style = formData.get('style') as string | null || 'classic';

    if (!file) {
      console.error("Validation Error: No file uploaded.");
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    console.log(`Received file: ${file.name}, size: ${file.size}, style: ${style}`);

    const validStyles = ['classic', 'minimalist', 'modern'];
    if (!validStyles.includes(style)) {
      console.error(`Validation Error: Invalid style specified: ${style}`);
      return NextResponse.json({ error: 'Invalid style specified' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    tempDocxPath = path.join(tmpdir(), `${randomUUID()}-${file.name || 'document.docx'}`);
    await writeFile(tempDocxPath, fileBuffer);
    console.log(`DOCX saved temporarily to: ${tempDocxPath}`);

    console.log("Attempting DOCX to HTML conversion with Mammoth...");
    let htmlContent: string;
    try {
        const result = await mammoth.convertToHtml({ path: tempDocxPath });
        htmlContent = result.value; // The generated HTML
        const messages = result.messages; // Any messages/warnings from Mammoth
        if (messages && messages.length > 0) {
            console.warn("Mammoth messages:", messages);
        }
        console.log(`Mammoth conversion successful. HTML length: ${htmlContent?.length ?? 'N/A'}`);
        if (!htmlContent || htmlContent.trim().length === 0) {
             console.error("ERROR: Mammoth produced empty HTML content!");
             // Optionally save the problematic DOCX for inspection
             // await fs.copyFile(tempDocxPath, path.join(process.cwd(), 'debug', `failed-${file.name || randomUUID()}.docx`));
             throw new Error("Mammoth conversion resulted in empty content.");
        }
        // --- DEBUG: Save raw Mammoth output ---
        tempRawHtmlPath = path.join(tmpdir(), `${randomUUID()}-raw.html`);
        await writeFile(tempRawHtmlPath, htmlContent);
        console.log(`DEBUG: Raw Mammoth HTML output saved to: ${tempRawHtmlPath}`);
        // --- END DEBUG ---
    } catch (mammothError: any) {
        console.error("ERROR during Mammoth conversion:", mammothError);
        throw new Error(`Failed to convert DOCX file: ${mammothError.message}`);
    }


    console.log(`Getting template for style: ${style}`);
    const template = await getTemplate(style);

    const titlePlaceholder = '{{title}}';
    const contentPlaceholder = '{{{content}}}';
    const title = file.name?.replace(/\.docx$/i, '') || 'Document';

    console.log(`Replacing placeholders: title="${title}", content length=${htmlContent.length}`);

    // Perform replacement
    let finalHtml = template.replace(titlePlaceholder, title);
    // Check if content placeholder exists before replacing
    if (!finalHtml.includes(contentPlaceholder)) {
         console.error(`ERROR: The template for style "${style}" loaded from getTemplate() does NOT contain the placeholder "${contentPlaceholder}". Replacement cannot occur.`);
         // Log snippet of template for verification
         console.error("Template snippet:", template.substring(0, 500));
         throw new Error(`Template is missing the '${contentPlaceholder}' placeholder.`);
    }
    finalHtml = finalHtml.replace(contentPlaceholder, htmlContent);

    // Verify replacement
    if (finalHtml.includes(contentPlaceholder)) {
        console.error("CRITICAL ERROR: Content placeholder replacement FAILED! The placeholder still exists in finalHtml.");
        // Consider throwing an error here as PDF generation will be wrong
        throw new Error("Failed to replace content placeholder in the template.");
    } else if (!finalHtml.includes(htmlContent.substring(0,50))) {
        // A basic check to see if *some* part of the expected content is now present
        console.warn("WARNING: Content placeholder removed, but start of expected HTML content not found in finalHtml. Check for unexpected modifications.");
    } else {
        console.log("Content placeholder replacement seems successful.");
    }

    tempFinalHtmlPath = path.join(tmpdir(), `${randomUUID()}-final.html`);
    await writeFile(tempFinalHtmlPath, finalHtml);
    console.log(`Final HTML written to: ${tempFinalHtmlPath}`);

    console.log("Launching Puppeteer...");
    let browser = null; // Define browser outside try block for finally
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] // Added disable-dev-shm-usage
      });
      const page = await browser.newPage();
      // Listen for console messages from the page being rendered
      page.on('console', msg => console.log('PAGE LOG:', msg.text()));
      page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
      page.on('requestfailed', request => console.warn(`PAGE REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`));

      console.log(`Puppeteer navigating to: file://${tempFinalHtmlPath}`);
      await page.goto(`file://${tempFinalHtmlPath}`, { waitUntil: 'networkidle0', timeout: 60000 }); // Increased timeout
      console.log("Navigation complete.");

      tempPdfPath = path.join(tmpdir(), `${randomUUID()}.pdf`);
      console.log(`Generating PDF at: ${tempPdfPath}`);
      await page.pdf({
        path: tempPdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' }
      });
      console.log("PDF generated.");
    } catch (puppeteerError: any) {
        console.error("ERROR during Puppeteer PDF generation:", puppeteerError);
        throw new Error(`Failed to generate PDF: ${puppeteerError.message}`);
    } finally {
        if (browser) {
            await browser.close();
            console.log("Puppeteer browser closed.");
        }
    }


    console.log("Uploading PDF to Cloudinary...");
    const uploadRes = await cloudinary.uploader.upload(tempPdfPath, {
      resource_type: 'raw',
      folder: 'books-pdf',
      public_id: path.parse(file.name || randomUUID()).name,
    });
    console.log("Cloudinary upload successful:", uploadRes.secure_url);

    const doc = uploadRes.secure_url;
    return NextResponse.json(doc);

  } catch (error: any) {
    // Ensure error logged here includes specific errors thrown earlier
    console.error('--- Request Failed ---');
    console.error('Error processing file upload:', error.message);
    // Determine error message based on specific errors thrown
    let errorMessage = error.message || 'Failed to process file'; // Default to the thrown message
    // You could add more specific checks here if needed, but relying on thrown messages is better
    return NextResponse.json({ error: errorMessage, details: error.stack }, { status: 500 });

  } finally {
    console.log("--- Cleanup ---");
    const cleanup = async (label: string, filePath: string | null) => {
      if (filePath) {
        try {
          await unlink(filePath);
          console.log(`Cleaned up ${label}: ${filePath}`);
        } catch (cleanupError: any) {
          // Log ENOENT (File not found) as info, other errors as errors
          if (cleanupError.code === 'ENOENT') {
            console.log(`Temp file already gone (${label}): ${filePath}`);
          } else {
            console.error(`Failed to delete temp file (${label}: ${filePath}):`, cleanupError);
          }
        }
      }
    };
    await cleanup("DOCX", tempDocxPath);
    await cleanup("Raw HTML", tempRawHtmlPath); // Cleanup the raw HTML file
    await cleanup("Final HTML", tempFinalHtmlPath);
    await cleanup("PDF", tempPdfPath);
    console.log("--- Request End ---");
  }
}