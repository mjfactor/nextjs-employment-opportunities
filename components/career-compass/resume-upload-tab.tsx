"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, AlertCircle, CheckCircle, Eye, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import mammoth from 'mammoth'

export default function ResumeUploadTab() {
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isValidResume, setIsValidResume] = useState<boolean | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState<"idle" | "uploading" | "validating" | "complete">("idle")
  const [showConfetti, setShowConfetti] = useState(false)


  // Reset progress when file changes
  useEffect(() => {
    if (file) {
      setUploadProgress(0)
      setUploadStage("uploading")
      simulateUploadProgress()
    } else {
      setUploadProgress(0)
      setUploadStage("idle")
    }
  }, [file])

  // Simulate upload progress
  const simulateUploadProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      // Use smaller, consistent increments (3-4%) for smoother animation
      progress += 3 + (Math.random() * 1);

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(100);
        setUploadStage("validating");
        validateResume();
      } else {
        setUploadProgress(progress);
      }
    }, 50); // Faster interval (50ms instead of 200ms)
  }

  // Function to extract text from DOCX
  const extractDocxText = async (file: File): Promise<string> => {
    try {
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Extract text using mammoth
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    } catch (error) {
      console.error('Error extracting text from DOCX:', error)
      throw new Error('Failed to extract text from DOCX')
    }
  }

  // Simulate validation progress after upload completes
  const validateResume = async () => {
    if (!file) return

    setIsValidating(true)

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'pdf') {
        // For PDF files, send directly to API
        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', file.name);
        formData.append('fileType', fileExtension);

        const response = await fetch("/api/validate-resume", {
          method: "POST",
          body: formData,
        });

        const validationResult = await response.json();
        setIsValidResume(validationResult.isValid);
      } else {
        // For DOCX files, extract text first
        let fileContent: string = await extractDocxText(file);
        if (fileExtension === 'docx') {
          console.log('--- Extracted DOCX Text ---');
          console.log(fileContent);
          console.log('--- End of DOCX Text ---');
        }

        // Use API with extracted text
        const response = await fetch("/api/validate-resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: fileContent.substring(0, 2000),
            filename: file.name,
            fileType: fileExtension || "unknown"
          }),
        });

        const validationResult = await response.json();
        setIsValidResume(validationResult.isValid);
      }

      setIsValidating(false);
      setUploadStage("complete");

      if (isValidResume) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
    } catch (error) {
      console.error("Error processing file:", error)
      setIsValidResume(false)
      setIsValidating(false)
      setUploadStage("complete")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      handleFileSelection(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      handleFileSelection(selectedFile)
    }
  }

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile)
    setIsValidResume(null)

    // Remove text file preview logic since we no longer accept txt files
    setFilePreview(null)
  }

  const removeFile = () => {
    setFile(null)
    setFilePreview(null)
    setIsValidResume(null)
    setUploadStage("idle")
    setUploadProgress(0)
  }

  // Generate confetti elements
  const renderConfetti = () => {
    return Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 8 + 4
      const color = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-pink-500", "bg-purple-500"][Math.floor(Math.random() * 5)]

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
                  : "border-gray-300 hover:border-primary/70 hover:shadow-sm hover:scale-[1.01]",
                "flex flex-col items-center justify-center gap-4",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("resume-upload")?.click()}
            >
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".docx,.pdf"
                onChange={handleFileChange}
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
                <p className="text-sm text-muted-foreground mt-1">PDF or DOCX only (max. 5MB)</p>
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
                      removeFile()
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
                      // Remove background colors that were making it hard to see
                      // Add indicator styling through CSS variables
                      isValidResume === true ? "[--progress-indicator:theme(colors.green.600)]" : "",
                      isValidResume === false ? "[--progress-indicator:theme(colors.red.600)]" : "",
                    )}
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
                  <Alert variant="destructive" className="border-red-400">
                    <AlertCircle className="h-4 w-4 text-red-800" />
                    <AlertDescription className="text-red-800 dark:text-red-100">
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
                  <Alert className="border-green-400">
                    <CheckCircle className="h-4 w-4 text-green-800" />
                    <AlertDescription className="text-green-800 dark:text-green-100">
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
            onClick={() => alert("Resume submitted successfully!")}
          >
            Submit Resume
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

