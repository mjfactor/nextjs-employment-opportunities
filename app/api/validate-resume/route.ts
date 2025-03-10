import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { stderr } from 'process';

// ==========================================
// Type Definitions
// ==========================================
type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'file'; data: ArrayBuffer; mimeType: string };

type ResumeInput = {
  text?: string,
  file?: ArrayBuffer,
  filename?: string
};

// ==========================================
// Resume Validation Logic
// ==========================================
/**
 * Validates if the provided content is a resume
 * @param input Object containing either text or file content to analyze
 * @returns Validation result with isValid flag
 */
async function validateResume(input: ResumeInput) {
  // Create messages for AI processing
  const messages = [
    {
      role: 'user' as const,
      content: [] as MessageContent[],
    }
  ];

  // Add instruction prompt
  messages[0].content.push({
    type: 'text',
    text: 'Analyze the following document and determine if it\'s a resume. Only respond with "YES" if it\'s a resume or "NO" if it\'s not a resume.'
  });

  // Add content to analyze based on input type
  if (input.file) {
    messages[0].content.push({
      type: 'file',
      data: input.file,
      mimeType: 'application/pdf'
    });
  } else if (input.text) {
    messages[0].content.push({
      type: 'text',
      text: `Content to analyze: ${input.text}`
    });
  }
  stderr.write('messages: ' + JSON.stringify(messages) + '\n');
  // Generate AI response
  const result = await generateText({
    model: google('gemini-1.5-flash'),
    messages
  });
  // Process and return results
  const isValid = result.text.toLowerCase().includes('yes');
  return { isValid, rawResponse: result };
}

// ==========================================
// API Route Handler
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Handle PDF files (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const filename = formData.get('filename') as string | null;

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided.' },
          { status: 400 }
        );
      }

      // Process file and validate
      const fileBuffer = await file.arrayBuffer();
      const validationResult = await validateResume({
        file: fileBuffer,
        filename: filename || file.name
      });

      return NextResponse.json(validationResult);
    }

    // Handle text content (JSON)
    else {
      const body = await request.json();
      const resumeText = body.text || '';

      if (!resumeText) {
        return NextResponse.json(
          { error: 'No resume text provided.' },
          { status: 400 }
        );
      }

      // Validate text content
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
