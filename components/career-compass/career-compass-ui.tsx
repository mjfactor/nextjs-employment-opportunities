"use client"

import { useState, useRef } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import ResumeUploadTab from "@/components/career-compass/resume-upload-tab"
import ManualDetailsTab from "@/components/career-compass/manual-details-tab"
// Import dialog components for confirmation
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function CareerAnalysis() {
    const [activeTab, setActiveTab] = useState("resume-upload")

    // Add refs to access tab components
    const resumeUploadRef = useRef<{ isAnalyzing: boolean, isStreaming: boolean, stopAnalysis: () => boolean } | null>(null)
    const manualDetailsRef = useRef<{ isAnalyzing: boolean, isStreaming: boolean, stopAnalysis?: () => void } | null>(null)

    // Add state for confirmation dialog
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        targetTab: "",
    })

    // Function to handle tab switch with confirmation if needed
    const handleTabChange = (value: string) => {
        // Check if analysis is in progress
        const isAnalysisActive =
            (activeTab === "resume-upload" && (resumeUploadRef.current?.isAnalyzing || resumeUploadRef.current?.isStreaming)) ||
            (activeTab === "manual-details" && (manualDetailsRef.current?.isAnalyzing || manualDetailsRef.current?.isStreaming))

        if (isAnalysisActive) {
            // Show confirmation dialog
            setConfirmDialog({
                isOpen: true,
                targetTab: value,
            })
        } else {
            // No analysis in progress, switch tab immediately
            setActiveTab(value)
        }
    }

    // Function to confirm tab switch and stop analysis
    const confirmTabSwitch = () => {
        // Stop analysis in the current tab
        if (activeTab === "resume-upload" && resumeUploadRef.current?.stopAnalysis) {
            resumeUploadRef.current.stopAnalysis()
        } else if (activeTab === "manual-details" && manualDetailsRef.current?.stopAnalysis) {
            manualDetailsRef.current.stopAnalysis()
        }

        // Switch to the target tab
        setActiveTab(confirmDialog.targetTab)

        // Close dialog
        setConfirmDialog({ isOpen: false, targetTab: "" })
    }

    return (
        <div className="space-y-6 w-full max-w-[95rem] mx-auto">
            <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
                    <TabsTrigger value="manual-details">Manual Details</TabsTrigger>
                </TabsList>

                <Card className="w-full border-none">
                    <CardContent className="pt-6">
                        {/* Always render both components but control visibility with CSS */}
                        <div style={{ display: activeTab === "resume-upload" ? 'block' : 'none' }}>
                            <ResumeUploadTab ref={resumeUploadRef} />
                        </div>
                        <div style={{ display: activeTab === "manual-details" ? 'block' : 'none' }}>
                            <ManualDetailsTab ref={manualDetailsRef} />
                        </div>
                    </CardContent>
                </Card>
            </Tabs>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.isOpen}
                onOpenChange={(open) => {
                    if (!open) setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }}
            >
                <DialogContent className="sm:max-w-[425px] rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Stop Analysis?
                        </DialogTitle>
                        <DialogDescription>
                            Switching tabs will immediately stop the current analysis process. Any partial results will remain visible. Are you sure you want to continue?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-4 sm:gap-4">
                        <Button variant="outline" onClick={() => setConfirmDialog({ isOpen: false, targetTab: "" })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmTabSwitch}>
                            Stop Analysis & Switch Tab
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}