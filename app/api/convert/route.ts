// app/api/convert-to-docx/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process'; // For executing shell commands
import { promisify } from 'util';     // To use exec with async/await
import * as fs from 'fs/promises';   // For async file system operations
import * as tmp from 'tmp';           // For creating temporary files

// Promisify exec for async/await usage
const execPromise = promisify(exec);

// Define a type for the request body
interface ConvertToDocxRequestBody {
  htmlContent: string;
  config: {
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
}

export async function POST(req: NextRequest) {
  let tempHtmlFilePath: string | undefined;
  let tempDocxFilePath: string | undefined;

  try {
    const { htmlContent, config }: ConvertToDocxRequestBody = await req.json();

    if (!htmlContent) {
      return NextResponse.json({ message: 'HTML content is required.' }, { status: 400 });
    }

    // 1. Create a temporary directory for input/output files
    const tmpDir = tmp.dirSync({ unsafeCleanup: true }); // unsafeCleanup: true ensures it's cleaned up on process exit
    const tempDirPath = tmpDir.name;

    // 2. Create a temporary HTML file
    tempHtmlFilePath = `${tempDirPath}/input.html`;
    await fs.writeFile(tempHtmlFilePath, htmlContent, 'utf8');

    // 3. Define the output DOCX file path
    tempDocxFilePath = `${tempDirPath}/output.docx`;

    // 4. Construct the LibreOffice command
    // `libreoffice --headless --convert-to docx --outdir <output_directory> <input_file>`
    // The exact command might vary slightly based on OS/installation.
    // On some systems, it might be `soffice` instead of `libreoffice`.
    const libreOfficeCommand = `libreoffice --headless --convert-to docx: --outdir "${tempDirPath}" "${tempHtmlFilePath}"`;

    // Log the command for debugging
    console.log(`Executing: ${libreOfficeCommand}`);

    // 5. Execute LibreOffice conversion
    const { stdout, stderr } = await execPromise(libreOfficeCommand, { timeout: 30000 }); // 30 second timeout

    if (stderr) {
      console.warn('LibreOffice Conversion Warning/Error:', stderr);
      // Decide if stderr should be treated as an error that prevents sending the file
      // For now, we'll continue if stderr exists but the file is created.
    }

    // 6. Check if the output DOCX file exists
    try {
      await fs.access(tempDocxFilePath); // Check if file exists and is accessible
    } catch (accessError) {
      console.error('Output DOCX file not found after conversion:', accessError);
      throw new Error('LibreOffice conversion failed: Output file not created.');
    }

    // 7. Read the generated DOCX file
    const docxBuffer = await fs.readFile(tempDocxFilePath);

    // 8. Send the DOCX file back to the client
    const docxBlob = new Blob([docxBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    return new NextResponse(docxBlob, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="document.docx"',
      },
    });

  } catch (error) {
    console.error('Error in DOCX conversion API:', error);
    // Provide more specific error messages for debugging
    let errorMessage = 'An unexpected error occurred during DOCX conversion.';
    if ((error as Error).message.includes('LibreOffice conversion failed')) {
      errorMessage = (error as Error).message;
    } else if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      errorMessage = 'LibreOffice executable not found. Please ensure LibreOffice is installed and in your server\'s PATH.';
    } else if ((error as Error).message.includes('timeout')) {
      errorMessage = 'LibreOffice conversion timed out. The HTML might be too complex or the server is under heavy load.';
    }

    return NextResponse.json(
      { message: errorMessage, error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    // 9. Clean up temporary files (important!)
    if (tempHtmlFilePath) {
      try { await fs.unlink(tempHtmlFilePath); } catch (e) { console.error('Failed to delete temp HTML file:', e); }
    }
    if (tempDocxFilePath) {
      try { await fs.unlink(tempDocxFilePath); } catch (e) { console.error('Failed to delete temp DOCX file:', e); }
    }
    // Clean up the temporary directory itself
    tmp.set
  }
}