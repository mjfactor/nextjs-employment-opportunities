"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResumeUploader } from "@/components/client/career-compass/resume-uploader"
import { ManualResumeForm } from "@/components/client/career-compass/manual-resume-form"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function ResumeSubmissionForm() {
    const [activeTab, setActiveTab] = useState<string>("upload")

    const handleResumeSubmit = (file: File) => {
        console.log("Resume submitted:", file)
        // Here you would use Vercel AI to validate if the file is a valid resume
        alert("Resume submitted successfully!")
    }

    const handleManualSubmit = (data: any) => {
        console.log("Manual resume data submitted:", data)
        alert("Resume information submitted successfully!")
    }

    return (
        <Card className="w-full shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-2xl">Resume Submission</CardTitle>
                <CardDescription className="text-base">
                    Upload your resume or manually enter your details to apply for the position.
                </CardDescription>
            </CardHeader>

            <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="upload">Upload Resume</TabsTrigger>
                        <TabsTrigger value="manual">Enter Details Manually</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="upload" className="mt-0 px-6 pb-6 pt-2">
                    <ResumeUploader
                        onFileSelect={(file) => {
                            console.log("File selected:", file)
                            // In a real implementation, you would use Vercel AI here to check
                            // if the uploaded file is a valid resume
                        }}
                        onSubmit={handleResumeSubmit}
                    />
                    <p className="text-sm text-muted-foreground mt-6">
                        Note: The Submit button will only appear if a valid resume is detected.
                    </p>
                </TabsContent>

                <TabsContent value="manual" className="mt-0">
                    <ManualResumeForm onSubmit={handleManualSubmit} />
                </TabsContent>
            </Tabs>
        </Card>
    )
}

