"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, AlertCircle, CheckCircle, Eye, X, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence, px } from "framer-motion"
import mammoth from 'mammoth'
// Import the server actions
import { validateResumeFile, validateResumeText } from "@/lib/actions/resume-validator"
import { generateAnswerFromFile, generateAnswerFromText } from "@/lib/actions/generate-answer-career-compass"
// Import markdown renderer
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import "@/styles/markdown-optimizations.css" // Re-add the CSS import

export default function ResumeUploadTab() {
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isValidResume, setIsValidResume] = useState<boolean | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState<"idle" | "uploading" | "validating" | "complete">("idle")
  const [showConfetti, setShowConfetti] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [resumeContent, setResumeContent] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [copied, setCopied] = useState(false);

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

      // Fix the timing issue - moved this check after we set the state
      setTimeout(() => {
        if (isValidResume) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }, 0);
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

  // Handle resume submission for analysis
  const submitResume = async () => {
    if (!file || !isValidResume) {
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisResult(null); // Clear previous results

      // Use the appropriate method based on file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let result;

      if (fileExtension === 'pdf') {
        // For PDF files, use the file upload method which handles PDFs directly
        const formData = new FormData();
        formData.append('file', file);

        // Add a timeout for the request - extended for Vercel deployment
        result = await Promise.race([
          generateAnswerFromFile(formData),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out after 60 seconds. This may be due to serverless function limitations.')), 60000)
          )
        ]);
      } else if (resumeContent) {
        // For DOCX, use the already extracted text (we extracted it during validation)
        // Add a timeout for the request
        result = await Promise.race([
          generateAnswerFromText(resumeContent),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out after 60 seconds. This may be due to serverless function limitations.')), 60000)
          )
        ]);
      } else {
        throw new Error("No valid content available for analysis");
      }

      if (!result?.answer && !result?.error) {
        throw new Error("Empty response from analysis service");
      }

      setAnalysisResult(result);
      console.log("Analysis complete:", result);
    } catch (error) {
      console.error("Error analyzing resume:", error);

      // Set a user-friendly error message
      setAnalysisResult({
        answer: '',
        error: error instanceof Error
          ? `Analysis failed: ${error.message}${error.message.includes('timed out') ?
            '\n\nTip: Try again or use a smaller file. Vercel has strict serverless function limits.' : ''}`
          : 'An unexpected error occurred during analysis. Please try again.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copy analysis to clipboard
  const copyToClipboard = () => {
    if (analysisResult?.answer) {
      navigator.clipboard.writeText(analysisResult.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 relative">
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">{renderConfetti()}</div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Upload Your Resume</h2>
        <p className="text-muted-foreground">Upload your resume to get personalized career recommendations</p>
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
                Analyzing Resume...
              </div>
            ) : (
              "Submit Resume"
            )}
          </Button>
        </motion.div>
      </div>

      {/* Analysis Results Section */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-10 border rounded-xl p-8 bg-card/80 backdrop-blur-sm shadow-lg shadow-primary/5"
          >
            <div className="flex justify-between items-center mb-6 pb-2 border-b">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                {analysisResult.error ? 'Analysis Error' : 'Your Career Analysis'}
              </h3>

              {analysisResult.answer && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 rounded-lg border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </div>

            {analysisResult.answer ? (
              <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:font-semibold prose-h3:text-lg prose-h2:text-xl prose-h1:text-2xl prose-p:my-3 markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-xl font-bold mt-6 mb-3 text-primary/90" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-lg font-semibold mt-5 mb-2 text-primary/80" {...props} />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4 className="text-base font-semibold mt-4 mb-2 text-primary/70" {...props} />
                    ),
                    a: ({ node, href, ...props }) => (
                      <a
                        href={href}
                        className="text-blue-600 dark:text-blue-400 font-medium underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="my-3 leading-relaxed" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-6 my-3 space-y-2" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-6 my-3 space-y-2" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="my-1" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-4 italic bg-slate-50 dark:bg-slate-800/50 rounded-r-lg" {...props} />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="border-collapse w-full bg-slate-50 dark:bg-slate-900/50" {...props} />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead className="border-b border-slate-200 dark:border-slate-800" {...props} />
                    ),
                    tr: ({ node, ...props }) => (
                      <tr className="border-b border-slate-200 dark:border-slate-800" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="border-r last:border-r-0 border-slate-200 dark:border-slate-800 px-4 py-3 text-left font-medium" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border-r last:border-r-0 border-slate-200 dark:border-slate-800 px-4 py-3" {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                      <hr className="my-8 border-slate-200 dark:border-slate-800" {...props} />
                    ),
                  }}
                >
                  {analysisResult.answer}
                </ReactMarkdown>
              </div>
            ) : null}

            {analysisResult.error && (
              <Alert variant="destructive" className="mt-2 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {analysisResult.error}
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}