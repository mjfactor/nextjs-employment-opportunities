"use server";

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

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

type ValidationResult = {
    isValid: boolean;
    message?: string;
    error?: string;
};

/**
 * Validates if the provided content is a resume
 * @param input Object containing either text or file content to analyze
 * @returns Validation result with isValid flag
 */
export async function validateResume(input: ResumeInput): Promise<ValidationResult> {
    try {
        // Check for missing content early
        if (!input.file && !input.text) {
            return {
                isValid: false,
                error: 'No content provided for validation'
            };
        }

        // Prepare instruction for AI
        const instruction: MessageContent = {
            type: 'text',
            text: 'Analyze the following document and determine if it\'s a resume. Only respond with "YES" if it\'s a resume or "NO" if it\'s not a resume.'
        };

        // Prepare content to analyze based on input type
        const contentToAnalyze: MessageContent = input.file
            ? {
                type: 'file',
                data: input.file,
                mimeType: 'application/pdf'
            }
            : {
                type: 'text',
                text: `Content to analyze: ${input.text}`
            };

        // Create message with both instruction and content
        const messages = [{
            role: 'user' as const,
            content: [instruction, contentToAnalyze]
        }];

        // Generate AI response
        const result = await generateText({
            model: google('gemini-1.5-flash'),
            messages
        });

        // Process and return results
        const isValid = result.text.toLowerCase().includes('yes');
        return {
            isValid,
            message: result.text.trim()
        };
    } catch (error) {
        console.error('Error validating resume:', error);
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Failed to validate resume'
        };
    }
}

/**
 * Process a file upload for resume validation
 */
export async function validateResumeFile(formData: FormData): Promise<ValidationResult> {
    try {
        const file = formData.get('file') as File | null;

        if (!file) {
            return { isValid: false, error: 'No file provided' };
        }

        // Process file and validate
        const fileBuffer = await file.arrayBuffer();
        return await validateResume({
            file: fileBuffer,
            filename: file.name
        });
    } catch (error) {
        console.error('Error processing file for validation:', error);
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Failed to process file'
        };
    }
}

/**
 * Process text content for resume validation
 */
export async function validateResumeText(text: string): Promise<ValidationResult> {
    if (!text || text.trim() === '') {
        return { isValid: false, error: 'No text provided' };
    }

    return await validateResume({ text });
}
