"use server";

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Type definitions
type CareerCompassInput = {
    text?: string,
    file?: ArrayBuffer,
    filename?: string
};

type CareerCompassResult = {
    answer: string;
    error?: string;
};

// Career compass prompt template
const CAREER_COMPASS_PROMPT = `
**STRICT PROCESSING ORDER (DO NOT SKIP):**
1. COMPLETE Candidate Profile Analysis FIRST
2. ONLY THEN proceed to Job Recommendations
3. Confirm all profile analysis sections are complete before continuing.
---

## 1. Candidate Profile Analysis

### A. Core Competency Identification
- 🏅 **Technical Strengths**
- 📊 **Skill Frequency Analysis**:
  - Analyze the frequency of skills mentionead
  - Estimate the frequency of skill usage based on work experience descriptions (e.g., years of experience using each skill).
- 🧩 **Unique Value Proposition**:
  - Identify what makes the candidate distinct, such as rare skill combinations (e.g., Python and blockchain expertise), 
    notable achievements (e.g., leading a successful project), or niche industry experience.
- 🎗️ **Certifications**:
  - List all the candidates certifications if they have any.

### B. Work Experience Summary (formerly Experience Archetype Mapping)
- ⏳ **Total Professional Tenure Breakdown**:
  - Summarize years of experience by role and industry.
- 🔀 **Multi-Industry Transfer Potential**:
  - Identify industries where the candidate's skills and experience are transferable (e.g., tech skills applicable to finance or healthcare).
  - Base recommendations on overlapping skills, certifications, or past projects.
- 📌 **Highlight: Most Impactful Project/Initiative**:
  - Describe the project, its impact, and relevance to career goals.

### C. Educational Pathway Analysis
- 🎓 **Degree Utilization Spectrum**:
  - Analyze possible applications of the candidate's degree to different careers.
  - Include relevant coursework or projects that align with potential career paths (e.g., a machine learning project for AI-related roles).
- 📜 **Certification Opportunities**:
  - Suggest certifications based on existing skills.
- 🌐 **Emerging Tech Alignment**:
  - Identify emerging technologies relevant to the candidate's field or interests (e.g., AI, blockchain, cybersecurity).
  - Assess alignment with their skills and education.

---
## 2. Job Recommendations
**DO NOT START BEFORE PROFILE ANALYSIS IS COMPLETE**
For each role (7-8 total, tailored to experience level):

### [Role Title] + Experience Level

| Assessment Metric     | Details |
|-----------------------|---------|
| 🔍 Skills Match       | [List of matching skills] |
| 👤 Experience Match   | [Experience alignment] |
| 📖 Education Match    | [Education relevance] |

#### 💵 Salary Benchmarks
- Emphasize that salaries vary significantly by industry, location, and company size.
  Refer to [Glassdoor](https://glassdoor.com) and [PayScale](https://payscale.com) for accurate, up-to-date information.

#### 🔗 Current Opportunities
- Provide 3-4 job search queries without specifying company names. Include recommended job boards or platforms (e.g., LinkedIn, Indeed, Glassdoor, JobStreet).
- Examples:
  - [Software Engineering](https://www.linkedin.com/jobs/search/?keywords=software%20engineer)
  - [Software Engineering](https://www.glassdoor.com/Job/software-engineer-jobs-SRCH_KO0,17.htm)
  - [Software Engineering](https://ph.indeed.com/jobs?q=software+engineer)

#### 📚 Skill Development
- Provide 4 resources for skill development, including a mix of types (e.g., online courses, certifications, tutorials, books).
- *Format tables EXACTLY as shown below:*

| Tutorial Title       | Description                          | Duration | Link |
|----------------------|--------------------------------------|----------|------|
| [Course Name]        | [Specific skills covered]            | Xh Ym    | URL  |
| [Certification Name] | [Relevance to role]                  | Xh Ym    | URL  |

#### 🌟 Career Path Projections
- Provide potential career paths or trajectories based on current skills and experience (e.g., 'With 5 years of Python experience, 
  you could transition to a Senior Developer or Data Scientist role').
- Include steps to achieve these paths (e.g., certifications, additional experience).

#### 🎲 Random Forest Insights
- Provide a brief, plausible explanation of how the pre-trained random forest model influenced the selection of this job role.
- Example: "The random forest prioritized your 5 years of Python experience and machine learning skills, 
  identifying this role as a strong match due to high demand in AI-driven industries."
- Keep it concise (1-2 sentences) and tie it to the job's relevance.

---
## 3. Overall Random Forest Data Evaluation
**Important:** Do not start until job recommendations are complete.

### Overall Job Fit Score Per Role
- Report the final fit score (e.g., 73.5%) for each role.
- Example Format:
  "Software Engineer: 75.9%"
  "Data Analyst: 68.2%"

---
**Formatting Rules:**
1. Table must:
   - Use pipe formatting with headers.
   - Keep descriptions under 25 words.
   - Show durations as Xh Ym.
2. Order Enforcement:
   - Profile Analysis → Job Recommendations (Role Title → Fit Score → Salary → Jobs → Skills → Career Paths → Random Forest Insights) 
     → Overall Random Forest Data Evaluation.
3. Link Rules:
   - Clean formatting: [Display Text](URL).
   - No broken links.
4. Language:
   - Ensure language is clear and accessible. Avoid overly technical terms unless necessary, and define them if used.
`;

/**
 * Main function to analyze resume content and generate career compass results
 * @param input Object containing either text or file content to analyze
 * @returns Analysis result with career recommendations
 */
export async function generateAnswerCareerCompass(input: CareerCompassInput): Promise<CareerCompassResult> {
    try {
        // Check for missing content
        if (!input.file && !input.text) {
            return {
                answer: '',
                error: 'No content provided for analysis'
            };
        }

        // Generate analysis using AI
        const model = google('gemini-2.0-flash');

        // For PDF files, use file-based approach with the LLM
        if (input.file && input.filename?.toLowerCase().endsWith('.pdf')) {
            // Create message with file content for PDFs
            const messages = [{
                role: 'user' as const,
                content: [
                    {
                        type: 'text' as const,
                        text: `${CAREER_COMPASS_PROMPT}

Analyze the resume in the attached PDF file using this format:
`
                    },
                    {
                        type: 'file' as const,
                        data: input.file,
                        mimeType: 'application/pdf'
                    }
                ]
            }];

            // Generate AI response with file
            const result = await generateText({
                model: model,
                messages: messages
            });

            return {
                answer: result.text
            };
        } else if (input.text) {
            // Text-based approach for direct text input
            const result = await generateText({
                model: model,
                prompt: `${CAREER_COMPASS_PROMPT}

RESUME CONTENT TO ANALYZE:
${input.text}
`
            });

            return {
                answer: result.text
            };
        } else {
            return {
                answer: '',
                error: 'Unsupported file format. Only PDF files or text content are supported.'
            };
        }
    } catch (error) {
        console.error('Error generating career compass answer:', error);
        return {
            answer: '',
            error: error instanceof Error ? error.message : 'Failed to generate career compass answer'
        };
    }
}

/**
 * Process a file upload for career analysis
 */
export async function generateAnswerFromFile(formData: FormData): Promise<CareerCompassResult> {
    try {
        const file = formData.get('file') as File | null;

        if (!file) {
            return {
                answer: '',
                error: 'No file provided'
            };
        }

        // Only process PDF files
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return {
                answer: '',
                error: 'Only PDF files are supported for direct upload'
            };
        }

        // Process file
        const fileBuffer = await file.arrayBuffer();
        return await generateAnswerCareerCompass({
            file: fileBuffer,
            filename: file.name
        });
    } catch (error) {
        console.error('Error processing file for career analysis:', error);
        return {
            answer: '',
            error: error instanceof Error ? error.message : 'Failed to process file'
        };
    }
}

/**
 * Process text content for career analysis
 */
export async function generateAnswerFromText(text: string): Promise<CareerCompassResult> {
    if (!text || text.trim() === '') {
        return {
            answer: '',
            error: 'No text provided'
        };
    }

    return await generateAnswerCareerCompass({ text });
}
