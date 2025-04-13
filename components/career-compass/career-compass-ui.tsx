"use client"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import ResumeUploadTab from "@/components/career-compass/resume-upload/resume-upload-tab"
import ManualDetailsTab from "@/components/career-compass/manual-details/manual-details-tab"
// Import tooltip components for enhanced UI
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { AlertTriangle, Upload, FileText, Info, PenLine } from "lucide-react"
// Import Framer Motion for animations
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner" // Assuming you use Sonner for toasts

// Interface for saved analysis data
interface SavedAnalysis {
    id: string;
    userId: string;
    source: string;
    structuredData: any;
    markdownResult: string;
    createdAt: string;
    updatedAt: string;
}

export default function CareerAnalysis({
    id,
    userId,
}: {
    id: any
    userId: any
}) {
    const [activeTab, setActiveTab] = useState("resume-upload")
    const [isLoading, setIsLoading] = useState(false)
    const [savedAnalysis, setSavedAnalysis] = useState<SavedAnalysis | null>(null)

    // Add refs to access tab components
    const resumeUploadRef = useRef<{ isAnalyzing: boolean, isStreaming: boolean, stopAnalysis: () => boolean, loadSavedAnalysis?: (data: any) => void } | null>(null)
    const manualDetailsRef = useRef<{ isAnalyzing: boolean, isStreaming: boolean, stopAnalysis?: () => void, loadSavedAnalysis?: (data: any) => void } | null>(null)

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

    // Fetch saved analysis on component mount
    useEffect(() => {
        const fetchSavedAnalysis = async () => {
            if (!userId) return

            try {
                setIsLoading(true)
                const response = await fetch('/api/career-analysis')

                if (response.status === 404) {
                    // No saved analysis found, which is fine
                    return
                }

                if (!response.ok) {
                    throw new Error(`Error fetching saved analysis: ${response.status}`)
                }

                const data = await response.json()
                setSavedAnalysis(data)

                // Set the active tab based on the source
                if (data.source === 'manual') {
                    setActiveTab('manual-details')
                } else {
                    setActiveTab('resume-upload')
                }

                // Show a toast notification
                toast.info('Previous analysis loaded')
            } catch (error) {
                console.error('Error fetching saved analysis:', error)
                toast.error('Could not load your previous analysis')
            } finally {
                setIsLoading(false)
            }
        }

        fetchSavedAnalysis()
    }, [userId])

    // Pass saved analysis to the appropriate component when available
    useEffect(() => {
        if (savedAnalysis) {
            if (savedAnalysis.source === 'resume' && resumeUploadRef.current?.loadSavedAnalysis) {
                resumeUploadRef.current.loadSavedAnalysis(savedAnalysis)
            } else if (savedAnalysis.source === 'manual' && manualDetailsRef.current?.loadSavedAnalysis) {
                manualDetailsRef.current.loadSavedAnalysis(savedAnalysis)
            }
        }
    }, [savedAnalysis, resumeUploadRef.current, manualDetailsRef.current])

    return (
        <div className="space-y-6 w-full max-w-[75rem] mx-auto pt-6">
            {/* Description section for Career Compass */}
            <div className="mb-8 px-6 text-center">
                <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent inline-block">Career Compass</h1>

                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="h-0.5 w-10 bg-gradient-to-r from-primary/30 to-primary/0"></div>
                    <span className="text-primary/80 text-sm font-medium">AI-Powered Career Insights</span>
                    <div className="h-0.5 w-10 bg-gradient-to-l from-primary/30 to-primary/0"></div>
                </div>

                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Unlock your professional potential with data-driven career guidance. Our advanced AI analyzes your background
                    to deliver personalized insights, skill recommendations, and growth opportunities tailored to your unique profile.
                </p>

                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="mt-2 rounded-full h-8 w-8">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                <span className="sr-only">About Career Compass</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px] p-3">
                            <p className="text-xs leading-relaxed">
                                Career Compass combines random forest with natural language processing to analyze your professional background
                                and provide actionable insights for career development.
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
                <div className="px-6">
                    <TabsList className="grid w-full grid-cols-2 mb-6 p-1.5 bg-card/50 backdrop-blur-sm border shadow-sm rounded-xl overflow-hidden relative">
                        {/* Animated background indicator */}
                        <motion.div
                            className="absolute top-1.5 bottom-1.5 rounded-lg bg-white dark:bg-zinc-800 shadow-sm z-0"
                            initial={false}
                            animate={{
                                x: activeTab === "resume-upload" ? "0%" : "100%",
                                width: "50%"
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <TabsTrigger
                                        value="resume-upload"
                                        className="rounded-lg px-8 py-3.5 min-h-[4rem] relative z-10 transition-all duration-200"
                                    >
                                        <motion.div
                                            className="flex flex-col items-center justify-center space-y-2 relative pb-2"
                                            initial={{ opacity: 0.8 }}
                                            animate={{
                                                opacity: activeTab === "resume-upload" ? 1 : 0.8,
                                                y: activeTab === "resume-upload" ? 0 : 5
                                            }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Upload className="h-5 w-5 text-primary" />
                                                <span className="font-medium">Resume Upload</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-normal">
                                                Upload your resume for instant analysis
                                            </p>
                                            <motion.div
                                                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-0.5 w-12 bg-primary"
                                                initial={{ scaleX: 0 }}
                                                animate={{
                                                    scaleX: activeTab === "resume-upload" ? 1 : 0
                                                }}
                                                transition={{ duration: 0.3 }}
                                                aria-hidden="true"
                                            />
                                        </motion.div>
                                    </TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="w-[250px] p-3">
                                    <div className="text-xs">
                                        <p className="font-medium mb-1">Upload your resume</p>
                                        <p>Supports PDF and DOCX formats (max 4MB)</p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <TabsTrigger
                                        value="manual-details"
                                        className="rounded-lg px-8 py-3.5 min-h-[4rem] relative z-10 transition-all duration-200"
                                    >
                                        <motion.div
                                            className="flex flex-col items-center justify-center space-y-2 relative pb-2"
                                            initial={{ opacity: 0.8 }}
                                            animate={{
                                                opacity: activeTab === "manual-details" ? 1 : 0.8,
                                                y: activeTab === "manual-details" ? 0 : 5
                                            }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <PenLine className="h-5 w-5 text-primary" />
                                                <span className="font-medium">Manual Details</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-normal">
                                                Enter your information manually
                                            </p>
                                            <motion.div
                                                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-0.5 w-12 bg-primary"
                                                initial={{ scaleX: 0 }}
                                                animate={{
                                                    scaleX: activeTab === "manual-details" ? 1 : 0
                                                }}
                                                transition={{ duration: 0.3 }}
                                                aria-hidden="true"
                                            />
                                        </motion.div>
                                    </TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="w-[250px] p-3">
                                    <div className="text-xs">
                                        <p className="font-medium mb-1">Enter details manually</p>
                                        <p>Input your skills, experience, and background for personalized career insights</p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </TabsList>
                </div>

                <Card className="w-full border-none shadow-sm">
                    <CardContent className="pt-6 px-6">
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
