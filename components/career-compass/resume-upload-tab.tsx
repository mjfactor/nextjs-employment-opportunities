"use client"

import type React from "react"
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, AlertCircle, CheckCircle, Eye, X, StopCircle, AlertTriangle, ArrowDown } from "lucide-react"
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

// Import dialog components for modern confirmation dialogs
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const ResumeUploadTab = forwardRef(function ResumeUploadTab(props, ref) {
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
  const [fileSizeError, setFileSizeError] = useState<boolean>(false)

  // Ref to track if component is mounted
  const isMounted = useRef(true);
  // Ref for abort controller to cancel fetch requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Expose analyzing state and stopAnalysis function through ref
  useImperativeHandle(ref, () => ({
    isAnalyzing,
    isStreaming,
    stopAnalysis: () => stopAnalysis()
  }));

  // State for managing confirmation dialogs
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: () => { },
  });

  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Cancel any in-progress fetch when unmounting
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
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

  //
  // FILE UPLOAD AND VALIDATION FUNCTIONS
  //

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

  //
  // FILE HANDLING FUNCTIONS
  //

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
    // Check if file exceeds 4MB
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB in bytes

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileSizeError(true);
      setFile(null);
      setIsValidResume(null);
      return;
    }

    setFileSizeError(false);
    setFile(selectedFile);
    setIsValidResume(null);

    // Remove text file preview logic since we no longer accept txt files
    setFilePreview(null);
  }

  const removeFile = () => {
    // Check if analysis is in progress and confirm before removing
    if (isAnalyzing || isStreaming) {
      setConfirmationDialog({
        isOpen: true,
        title: "Stop Analysis?",
        description: "Removing the file will stop the current analysis. This action cannot be undone.",
        action: () => {
          stopAnalysis();
          setFile(null);
          setFilePreview(null);
          setIsValidResume(null);
          setUploadStage("idle");
          setUploadProgress(0);
          setFileSizeError(false);
        }
      });
      return;
    }

    setFile(null);
    setFilePreview(null);
    setIsValidResume(null);
    setUploadStage("idle");
    setUploadProgress(0);
    setFileSizeError(false);
  }

  //
  // ANALYSIS FUNCTIONS
  //

  // Function to stop analysis with confirmation
  const stopAnalysis = (showConfirmation = false) => {
    if (showConfirmation) {
      setConfirmationDialog({
        isOpen: true,
        title: "Stop Analysis?",
        description: "This will immediately stop the current analysis process. Any partial results will remain visible.",
        action: () => {
          // Actual stop logic
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
          }

          if (isMounted.current) {
            setIsAnalyzing(false);
            setIsStreaming(false);
          }
        }
      });
      return false;
    }

    // If not showing confirmation, just stop the analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (isMounted.current) {
      setIsAnalyzing(false);
      setIsStreaming(false);
    }

    return true;
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

      // Create an AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

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

      // Make the API call with streaming response and abort signal
      const response = await fetch('/api/career-compass', {
        method: 'POST',
        body: formData,
        signal, // Pass the abort signal
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

    } catch (error: unknown) {
      // Check if this was an abort error (user cancelled)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Analysis was cancelled by the user');
      } else {
        console.error("Error analyzing resume:", error);
        setAnalysisError(error instanceof Error ? error.message : 'An error occurred during analysis');
      }
    } finally {
      if (isMounted.current) {
        setIsAnalyzing(false);
        setIsStreaming(false);
      }
      // Clear the abort controller reference
      abortControllerRef.current = null;
    }
  };

  // Add a reference to the analysis results container
  const analysisContainerRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom of the analysis
  const scrollToBottom = () => {
    if (analysisContainerRef.current) {
      analysisContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Career Compass</h2>
        <p className="text-muted-foreground text-base">Upload your resume and let our AI analyze your skills, experience, and potential. Get personalized insights to accelerate your career journey.</p>
        <p className="text-xs text-muted-foreground">Our system uses a sophisticated <span className="font-medium text-primary">Random Forest model</span> to identify key qualifications and skills from your resume, combined with a state-of-the-art <span className="font-medium text-primary">Large Language Model (LLM)</span> to provide detailed career insights and recommendations tailored specifically to your professional background.</p>
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
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all bg-card/30 backdrop-blur-sm",
                isDragging
                  ? "border-primary bg-primary/10 scale-[1.02] shadow-xl shadow-primary/20"
                  : "border-gray-300/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01]",
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
                className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center shadow-inner"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="h-8 w-8 text-primary" />
              </motion.div>

              <div>
                <p className="font-medium text-base">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF or DOCX only (max. 4MB)</p>
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
            <Card className="p-3 relative overflow-hidden rounded-lg border-transparent shadow-lg shadow-primary/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center shadow-inner">
                  <FileText className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-base truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>

                <div className="flex items-center gap-1">
                
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors"
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
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      {uploadStage === "validating" && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full"
                        />
                      )}
                      {getStageText()}
                    </span>
                    {uploadStage === "uploading" && <span>{Math.round(uploadProgress)}%</span>}
                  </div>

                  <Progress
                    value={uploadProgress}
                    className={cn(
                      "h-1.5 rounded-full transition-colors",
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
                  <Alert variant="destructive" className="border-red-400 rounded-lg shadow-lg shadow-red-500/10 py-2">
                    <AlertCircle className="h-3.5 w-3.5 text-red-800" />
                    <AlertDescription className="text-red-800 dark:text-red-100 text-xs">
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
                  <Alert className="border-green-400 rounded-lg bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/10 py-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-800 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-100 text-xs">
                      Valid resume detected! You can now submit your resume for analysis.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Size Error UI */}
      <AnimatePresence>
        {fileSizeError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 shadow-sm py-2">
              <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200 text-xs">
                Your file exceeds the maximum size limit of 4MB. Please upload a smaller file or try compressing it.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note about analyze button visibility */}
      <AnimatePresence>
        {file && isValidResume === null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-blue-300 rounded-lg bg-blue-50 dark:bg-blue-900/20 shadow-sm py-2">
              <AlertCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs">
                The analyze button will only appear once your document is validated as a resume.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end gap-2">
        {/* Stop Analysis Button */}
        <AnimatePresence>
          {(isAnalyzing || isStreaming) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="destructive"
                size="sm"
                className="mt-1 rounded-lg font-medium"
                onClick={() => stopAnalysis(true)}
              >
                <div className="flex items-center gap-1.5">
                  <StopCircle className="h-4 w-4" />
                  Stop Analysis
                </div>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: isValidResume ? 1 : 0,
            y: isValidResume ? 0 : 10,
          }}
          transition={{ duration: 0.3 }}
        >
          <Button
            size="sm"
            disabled={!isValidResume || isValidating || isAnalyzing}
            className={cn(
              "mt-1 rounded-lg font-medium transition-all",
              isAnalyzing ? "bg-primary/80" : "bg-gradient-to-r from-primary to-blue-500 hover:shadow-lg hover:shadow-primary/20"
            )}
            onClick={submitResume}
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                />
                {isStreaming ? "Analyzing Resume..." : "Analyzing..."}
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
            className="mt-6 border rounded-lg p-4 bg-card shadow-md"
            ref={analysisContainerRef}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex justify-between items-center mb-3 pb-2 border-b"
            >
              <h3 className="text-xl font-bold text-primary">
                {isStreaming ? "Streaming Analysis..." : "Your Career Analysis"}
              </h3>
            </motion.div>

            {/* Performance optimization: Simplified styling */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="prose prose-sm max-w-none dark:prose-invert"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-6 mb-3 pb-1 border-b" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-4 mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-3 mb-2" {...props} />,
                  h4: ({ node, ...props }) => <h4 className="text-sm font-semibold mt-3 mb-1" {...props} />,
                  a: ({ node, href, ...props }) => (
                    <a href={href} className="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  p: ({ node, ...props }) => <p className="my-2 text-sm" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
                  li: ({ node, ...props }) => <li className="my-1 text-sm" {...props} />,
                  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/30 pl-3 py-1 my-3 italic text-sm" {...props} />,
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4 border rounded">
                      <table className="w-full text-sm" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => <thead className="border-b" {...props} />,
                  tr: ({ node, ...props }) => <tr className="border-b" {...props} />,
                  th: ({ node, ...props }) => <th className="border-r last:border-r-0 px-3 py-2 text-left font-medium" {...props} />,
                  td: ({ node, ...props }) => <td className="border-r last:border-r-0 px-3 py-2" {...props} />,
                  hr: ({ node, ...props }) => <hr className="my-4" {...props} />,
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
                <Alert variant="destructive" className="mt-4 rounded-lg py-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <AlertDescription className="text-xs">{analysisError}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to bottom button - only shows during analysis */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToBottom}
            className="fixed bottom-6 right-6 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all z-50 flex items-center justify-center"
            aria-label="Scroll to bottom of analysis"
          >
            <ArrowDown className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modern confirmation dialog */}
      <Dialog
        open={confirmationDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
        }}
      >
        <DialogContent className="sm:max-w-[400px] rounded-lg p-4 border-none shadow-xl bg-gradient-to-b from-card to-card/90 backdrop-blur-sm">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {confirmationDialog.title}
            </DialogTitle>
            <DialogDescription className="text-sm pt-1 opacity-80">
              {confirmationDialog.description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-3 gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}
              className="w-full sm:w-auto rounded-lg border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                confirmationDialog.action();
                setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
              }}
              className="w-full sm:w-auto rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
});

export default ResumeUploadTab;