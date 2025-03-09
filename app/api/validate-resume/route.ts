import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

async function validateResume(resumeText: string) {
  const result = await generateText({
    model: google('gemini-1.5-flash'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze the following text and determine if it's a resume. Only respond with "YES" if it's a resume or "NO" if it's not a resume: ${resumeText}`,
          },
        ],
      },
    ]
  });

  // Extract clear boolean result
  const isValid = result.text.toLowerCase().includes('yes');
  return { isValid, rawResponse: result };
}

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const body = await request.json();
    const resumeText = body.text || '';

    if (!resumeText) {
      return NextResponse.json(
        { error: 'No resume text provided.' },
        { status: 400 }
      );
    }

    // Validate the resume using AI
    const validationResult = await validateResume(resumeText);

    return NextResponse.json(validationResult);
  } catch (error) {
    console.error('Error validating resume:', error);
    return NextResponse.json(
      { error: 'Failed to validate resume.' },
      { status: 500 }
    );
  }
}
