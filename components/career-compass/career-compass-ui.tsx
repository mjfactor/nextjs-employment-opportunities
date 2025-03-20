"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResumeUpload } from "@/components/career-compass/resume-upload-tab"
import { ManualDataEntry } from "@/components/career-compass/manual-details-tab"

export default function CareerCompass() {
    return (
        <div className="w-full max-w-6xl mx-auto">
            <Tabs defaultValue="resume-upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
                    <TabsTrigger value="manual-entry">Manual Data Entry</TabsTrigger>
                </TabsList>
                <TabsContent value="resume-upload">
                    <ResumeUpload />
                </TabsContent>
                <TabsContent value="manual-entry">
                    <ManualDataEntry />
                </TabsContent>
            </Tabs>
        </div>
    )
}

