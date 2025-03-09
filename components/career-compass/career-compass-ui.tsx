"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import ResumeUploadTab from "@/components/career-compass/resume-upload-tab"
import ManualDetailsTab from "@/components/career-compass/manual-details-tab"

export default function CareerAnalysis() {
    const [activeTab, setActiveTab] = useState("resume-upload")

    return (
        <div className="space-y-6 w-full">
            <Tabs defaultValue="resume-upload" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
                    <TabsTrigger value="manual-details">Manual Details</TabsTrigger>
                </TabsList>

                <Card className="w-full">
                    <CardContent className="pt-6">
                        <TabsContent value="resume-upload" className="mt-0">
                            <ResumeUploadTab />
                        </TabsContent>

                        <TabsContent value="manual-details" className="mt-0">
                            <ManualDetailsTab />
                        </TabsContent>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    )
}