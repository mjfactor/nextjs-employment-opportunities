import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, AlertCircle, CheckCircle, Eye, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"

interface ResumeUploadUIProps {
    file: File | null
    filePreview: string | null
    isDragging: boolean
    isValidating: boolean
    isValidResume: boolean | null
    uploadProgress: number
    uploadStage: "idle" | "uploading" | "validating" | "complete"
    showConfetti: boolean
    onDragOver: (e: React.DragEvent) => void
    onDragLeave: () => void
    onDrop: (e: React.DragEvent) => void
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemoveFile: () => void
    onSubmit: () => void
}

export default function ResumeUploadUI({
    file,
    filePreview,
    isDragging,
    isValidating,
    isValidResume,
    uploadProgress,
    uploadStage,
    showConfetti,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileChange,
    onRemoveFile,
    onSubmit,
}: ResumeUploadUIProps) {
    // Generate confetti elements
    const renderConfetti = () => {
        return Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 8 + 4
            const color = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-pink-500", "bg-purple-500"][
                Math.floor(Math.random() * 5)
            ]

            return (
                <motion.div
                    key={i}
                    className={`absolute rounded-full ${color}`}
                    initial={{
                        x: "50%",
                        y: "50%",
                        width: size,
                        height: size,
                        opacity: 1,
                    }}
                    animate={{
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        opacity: 0,
                    }}
                    transition={{
                        duration: Math.random() * 2 + 1,
                        ease: "easeOut",
                    }}
                />
            )
        })
    }

    // Get upload stage text
    const getStageText = () => {
        switch (uploadStage) {
            case "uploading":
                return "Uploading file..."
            case "validating":
                return "Validating resume..."
            case "complete":
                return isValidResume ? "Validation complete!" : "Validation failed"
            default:
                return ""
        }
    }

    return (
        <div className="space-y-6 relative">
            {showConfetti && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">{renderConfetti()}</div>
            )}

            <h2 className="text-2xl font-semibold mb-4">Upload Your Resume</h2>

            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        key="upload-area"
                    >
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all",
                                isDragging
                                    ? "border-primary bg-primary/10 scale-102 shadow-lg"
                                    : "border-gray-300 hover:border-primary/50 hover:bg-primary/5",
                                "flex flex-col items-center justify-center gap-4",
                            )}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            onClick={() => document.getElementById("resume-upload")?.click()}
                        >
                            <input
                                type="file"
                                id="resume-upload"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={onFileChange}
                            />

                            <motion.div
                                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Upload className="h-8 w-8 text-primary" />
                            </motion.div>

                            <div>
                                <p className="font-medium">Click to upload or drag and drop</p>
                                <p className="text-sm text-muted-foreground mt-1">PDF, DOC, DOCX or TXT (max. 5MB)</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        key="file-preview"
                        className="space-y-4"
                    >
                        <Card className="p-4 relative overflow-hidden">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {filePreview && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                // Open preview in modal or expand in place
                                                alert("Preview functionality would open here")
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">Preview</span>
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onRemoveFile()
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Remove</span>
                                    </Button>
                                </div>
                            </div>

                            {uploadStage !== "idle" && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>{getStageText()}</span>
                                        {uploadStage === "uploading" && <span>{Math.round(uploadProgress)}%</span>}
                                    </div>

                                    <Progress
                                        value={uploadProgress}
                                        className={cn(
                                            "h-2 transition-colors",
                                            uploadStage === "validating" ? "animate-pulse" : "",
                                            isValidResume === true ? "bg-green-100" : "",
                                            isValidResume === false ? "bg-red-100" : "",
                                        )}
                                        // Pass indicator styles through the data-state attribute
                                        style={{
                                            "--progress-indicator-color": isValidResume === true
                                                ? "var(--green-500)"
                                                : isValidResume === false
                                                    ? "var(--red-500)"
                                                    : "var(--primary)"
                                        } as React.CSSProperties}
                                    />
                                </div>
                            )}
                        </Card>

                        <AnimatePresence>
                            {isValidResume === false && !isValidating && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Alert variant="destructive" className="border-red-300 bg-red-50">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            The uploaded file does not appear to be a valid resume. Please upload a resume document.
                                        </AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}

                            {isValidResume === true && !isValidating && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Alert className="border-green-300 bg-green-50">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-600">
                                            Valid resume detected! You can now submit your resume for analysis.
                                        </AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-end">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: isValidResume ? 1 : 0,
                        y: isValidResume ? 0 : 10,
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <Button
                        disabled={!isValidResume || isValidating}
                        className="mt-4"
                        onClick={onSubmit}
                    >
                        Submit Resume
                    </Button>
                </motion.div>
            </div>
        </div>
    )
}
