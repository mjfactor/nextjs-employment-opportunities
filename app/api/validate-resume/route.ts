import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

// Define message content types for AI
type MessageContent = 
  | { type: 'text'; text: string }
  | { type: 'file'; data: ArrayBuffer; mimeType: string };

// Updated to handle either text or PDF buffer
async function validateResume(input: { text?: string, file?: ArrayBuffer, filename?: string }) {
  // Create messages based on input type
  const messages = [
    {
      role: 'user' as const,
      content: [] as MessageContent[],
    }
  ];

  // Add text prompt
  messages[0].content.push({
    type: 'text' as const,
    text: 'Analyze the following document and determine if it\'s a resume. Only respond with "YES" if it\'s a resume or "NO" if it\'s not a resume.'
  });

  // Add file data if provided
  if (input.file) {
    messages[0].content.push({
      type: 'file' as const,
      data: input.file,
      mimeType: 'application/pdf'
    });
  } else if (input.text) {
    // If no file but we have text, append the text to review
    messages[0].content.push({
      type: 'text' as const,
      text: `Content to analyze: ${input.text}`
    });
  }

  const result = await generateText({
    model: google('gemini-1.5-flash'),
    messages
  });

  // Extract clear boolean result
  const isValid = result.text.toLowerCase().includes('yes');
  return { isValid, rawResponse: result };
}

export async function POST(request: NextRequest) {
  try {
    // Check content type to determine how to process the request
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (PDF files)
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const filename = formData.get('filename') as string | null;

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided.' },
          { status: 400 }
        );
      }

      // Convert file to ArrayBuffer
      const fileBuffer = await file.arrayBuffer();

      // Validate the PDF using AI
      const validationResult = await validateResume({
        file: fileBuffer,
        filename: filename || file.name
      });

      return NextResponse.json(validationResult);
    } else {
      // Handle JSON (pre-processed text from DOCX)
      const body = await request.json();
      const resumeText = body.text || '';

      if (!resumeText) {
        return NextResponse.json(
          { error: 'No resume text provided.' },
          { status: 400 }
        );
      }

      // Validate the resume text using AI
      const validationResult = await validateResume({ text: resumeText });

      return NextResponse.json(validationResult);
    }
  } catch (error) {
    console.error('Error validating resume:', error);
    return NextResponse.json(
      { error: 'Failed to validate resume.' },
      { status: 500 }
    );
  }
}
