import { google } from '@ai-sdk/google';
import { streamText } from "ai"

export const maxDuration = 30 // Allow responses up to 30 seconds
const model = google('gemini-2.0-flash');
export async function POST(req: Request) {
  const { messages } = await req.json()

  // Use the AI SDK to validate if the uploaded file is a resume
  const result = streamText({
    model: model,
    messages,
    system:
      "You are a resume validation assistant. Your task is to determine if the provided text appears to be a resume. Respond with 'This is a valid resume' if it contains typical resume elements like work experience, education, skills, or contact information. Otherwise, respond with 'This is not a valid resume'.",
  })

  return result.toDataStreamResponse()
}

