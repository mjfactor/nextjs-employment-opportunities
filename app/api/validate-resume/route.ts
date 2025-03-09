import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30 // Allow responses up to 30 seconds

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Use the AI SDK to validate if the uploaded file is a resume
  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system:
      "You are a resume validation assistant. Your task is to determine if the provided text appears to be a resume. Respond with 'This is a valid resume' if it contains typical resume elements like work experience, education, skills, or contact information. Otherwise, respond with 'This is not a valid resume'.",
  })

  return result.toDataStreamResponse()
}

