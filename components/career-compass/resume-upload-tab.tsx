"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, AlertCircle, CheckCircle, Eye, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import mammoth from 'mammoth'
// Import the server actions for validation only
import { validateResumeFile, validateResumeText } from "@/lib/actions/resume-validator"
// Import markdown renderer
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import "@/styles/markdown-optimizations.css"

export default function ResumeUploadTab() {
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isValidResume, setIsValidResume] = useState<boolean | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState<"idle" | "uploading" | "validating" | "complete">("idle")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [resumeContent, setResumeContent] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string>("")
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false);

  // Ref to track if component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    }
  }, []);

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
      let extractedText = '';

      if (fileExtension === 'pdf') {
        // For PDF files, use the server action directly
        const formData = new FormData();
        formData.append('file', file);

        const validationResult = await validateResumeFile(formData);
        setIsValidResume(validationResult.isValid);

        if (validationResult.error) {
          console.error("Validation error:", validationResult.error);
        }
      } else {
        // For DOCX files, extract text first then use the server action
        extractedText = await extractDocxText(file);

        const validationResult = await validateResumeText(extractedText.substring(0, 2000));
        setIsValidResume(validationResult.isValid);

        if (validationResult.error) {
          console.error("Validation error:", validationResult.error);
        }
      }

      // Store the extracted text for later submission
      if (extractedText) {
        setResumeContent(extractedText);
      }

      setIsValidating(false);
      setUploadStage("complete");
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

  // Handle resume submission for analysis with streaming
  const submitResume = async () => {
    if (!file && !resumeContent || !isValidResume) {
      return;
    }

    try {
      setIsAnalyzing(true);
      setIsStreaming(true);
      setAnalysisResult("");
      setAnalysisError(null);

      // Create form data for the API request
      const formData = new FormData();

      if (file && file.name.toLowerCase().endsWith('.pdf')) {
        // For PDF files, upload the file directly
        formData.append('file', file);
      } else if (resumeContent) {
        // For DOCX or extracted text content
        formData.append('text', resumeContent);
      } else {
        throw new Error("No valid content available for analysis");
      }

      // Make the API call with streaming response
      const response = await fetch('/api/career-compass', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Try to parse error response
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        } catch (e) {
          throw new Error(`Error: ${response.status}`);
        }
      }

      // Read and process the streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response has no readable body");
      }

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          if (isMounted.current) {
            setAnalysisResult(prev => prev + chunk);
          }
        }

        if (done) break;
      }

    } catch (error) {
      console.error("Error analyzing resume:", error);
      setAnalysisError(error instanceof Error ? error.message : 'An error occurred during analysis');
    } finally {
      if (isMounted.current) {
        setIsAnalyzing(false);
        setIsStreaming(false);
      }
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Unlock Your Career Potential</h2>
        <p className="text-muted-foreground text-lg">Upload your resume and let our AI analyze your skills, experience, and potential. Get personalized insights to accelerate your career journey.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm">AI-powered skill assessment</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm">Smart document parsing</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm">Detailed career recommendations</p>
          </div>
        </div>
      </div>

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
                "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all bg-card/30 backdrop-blur-sm",
                isDragging
                  ? "border-primary bg-primary/10 scale-[1.02] shadow-xl shadow-primary/20"
                  : "border-gray-300/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01]",
                "flex flex-col items-center justify-center gap-6",
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
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center shadow-inner"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="h-10 w-10 text-primary" />
              </motion.div>

              <div>
                <p className="font-medium text-lg">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground mt-2">PDF or DOCX only (max. 5MB)</p>
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
            className="space-y-5"
          >
            <Card className="p-5 relative overflow-hidden rounded-xl border-transparent shadow-lg shadow-primary/5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center shadow-inner">
                  <FileText className="h-6 w-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-lg truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>

                <div className="flex items-center gap-2">
                  {filePreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 rounded-full p-0 hover:bg-primary/10 hover:text-primary transition-colors"
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
                    className="h-9 w-9 rounded-full p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors"
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
                <div className="mt-5 space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="flex items-center gap-2">
                      {uploadStage === "validating" && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                        />
                      )}
                      {getStageText()}
                    </span>
                    {uploadStage === "uploading" && <span>{Math.round(uploadProgress)}%</span>}
                  </div>

                  <Progress
                    value={uploadProgress}
                    className={cn(
                      "h-2 rounded-full transition-colors",
                      uploadStage === "validating" ? "animate-pulse" : "",
                      isValidResume === true ? "[--progress-indicator:theme(colors.green.500)]" : "",
                      isValidResume === false ? "[--progress-indicator:theme(colors.red.500)]" : "",
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
                  <Alert variant="destructive" className="border-red-400 rounded-xl shadow-lg shadow-red-500/10">
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
                  <Alert className="border-green-400 rounded-xl bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-800 dark:text-green-400" />
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
            disabled={!isValidResume || isValidating || isAnalyzing}
            className={cn(
              "mt-2 px-6 py-6 h-auto rounded-xl font-medium text-base transition-all",
              isAnalyzing ? "bg-primary/80" : "bg-gradient-to-r from-primary to-blue-500 hover:shadow-lg hover:shadow-primary/20"
            )}
            onClick={submitResume}
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                />
                {isStreaming ? "Analyzing Resume (Streaming...)" : "Analyzing Resume..."}
              </div>
            ) : (
              "Submit Resume"
            )}
          </Button>
        </motion.div>
      </div>

      {/* Analysis Results Section - Always show when streaming or has content */}
      <AnimatePresence mode="wait">
        {(isStreaming || analysisResult) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-10 border rounded-xl p-8 bg-card shadow-md"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex justify-between items-center mb-6 pb-2 border-b"
            >
              <h3 className="text-2xl font-bold text-primary">
                {isStreaming ? "Streaming Analysis..." : "Your Career Analysis"}
              </h3>
            </motion.div>

            {/* Performance optimization: Simplified styling */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="prose prose-sm md:prose-base max-w-none dark:prose-invert"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-6 mb-3" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-5 mb-2" {...props} />,
                  h4: ({ node, ...props }) => <h4 className="text-base font-semibold mt-4 mb-2" {...props} />,
                  a: ({ node, href, ...props }) => (
                    <a href={href} className="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  p: ({ node, ...props }) => <p className="my-3" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-3" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-3" {...props} />,
                  li: ({ node, ...props }) => <li className="my-1" {...props} />,
                  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-4 italic" {...props} />,
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-6 border rounded">
                      <table className="w-full" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => <thead className="border-b" {...props} />,
                  tr: ({ node, ...props }) => <tr className="border-b" {...props} />,
                  th: ({ node, ...props }) => <th className="border-r last:border-r-0 px-4 py-3 text-left font-medium" {...props} />,
                  td: ({ node, ...props }) => <td className="border-r last:border-r-0 px-4 py-3" {...props} />,
                  hr: ({ node, ...props }) => <hr className="my-8" {...props} />,
                }}
              >
                {analysisResult}
              </ReactMarkdown>
            </motion.div>

            {analysisError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Alert variant="destructive" className="mt-6 rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{analysisError}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}