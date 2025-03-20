"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, FileUp, CheckCircle, AlertCircle, File, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import mammoth from "mammoth"
import { validateResumeFile, validateResumeText } from "@/lib/actions/resume-validator"
import { useChat } from '@ai-sdk/react'

export function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [isValidResume, setIsValidResume] = useState<boolean | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [showErrorAnimation, setShowErrorAnimation] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)

  // Initialize the useChat hook with the correct API endpoint
  const { messages, handleSubmit, status, stop, error, reload, setInput } = useChat({
    api: "/api/career-compass" // Use the career-compass API endpoint
  });

  // Reset animation states when file changes
  useEffect(() => {
    setShowSuccessAnimation(false)
    setShowErrorAnimation(false)
    setShowAnalysis(false)
  }, [file])

  // Simulate progress during upload
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null

    if (isUploading) {
      setUploadProgress(0)
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress > 90 ? 90 : newProgress // Cap at 90% until complete
        })
      }, 300)
    } else if (uploadProgress > 0) {
      // Complete the progress bar when upload is done
      setUploadProgress(100)
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval)
    }
  }, [isUploading])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      validateAndSetFile(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      validateAndSetFile(droppedFile)
    }
  }

  const extractTextFromDocx = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        if (!event.target?.result) {
          reject("Failed to read file");
          return;
        }

        try {
          // Convert the array buffer to a mammoth-compatible format
          const arrayBuffer = event.target.result as ArrayBuffer;

          // Use mammoth to extract text
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } catch (error) {
          console.error("Error extracting text from DOCX:", error)
          reject("Failed to extract text from DOCX")
        }
      }

      reader.onerror = () => {
        reject("Error reading file")
      }

      reader.readAsArrayBuffer(file)
    })
  }

  const validateAndSetFile = async (file: File) => {
    const fileType = file.type
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

    if (!validTypes.includes(fileType)) {
      alert("Please upload a PDF or DOCX file")
      return
    }

    setFile(file)
    setIsUploading(true)
    setExtractedText("") // Reset any previous text

    try {
      // If it's a DOCX file, extract the text for display purposes
      if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        try {
          const text = await extractTextFromDocx(file)
          setExtractedText(text)

          // Use server action to validate the extracted text
          const validationResult = await validateResumeText(text)
          setIsValidResume(validationResult.isValid)

          // Trigger appropriate animation
          if (validationResult.isValid) {
            setShowSuccessAnimation(true)
          } else {
            setShowErrorAnimation(true)
          }
        } catch (error) {
          console.error("Error extracting text from DOCX:", error)
          await validateWithFormData(file) // Fallback to file upload if text extraction fails
        }
      } else {
        // For PDF files, use the file upload validation
        await validateWithFormData(file)
      }
    } catch (error) {
      console.error("Error processing file:", error)
      setIsValidResume(false)
      setShowErrorAnimation(true)
    } finally {
      setIsUploading(false)
    }
  }

  const validateWithFormData = async (file: File) => {
    // Create FormData and append the file
    const formData = new FormData()
    formData.append('file', file)

    // Call the server action to validate the file
    const validationResult = await validateResumeFile(formData)

    // Update the state based on validation result
    setIsValidResume(validationResult.isValid)

    // Trigger appropriate animation
    if (validationResult.isValid) {
      setShowSuccessAnimation(true)
    } else {
      setShowErrorAnimation(true)
    }
  }

  const handleAnalyze = () => {
    if (!file) return;

    setShowAnalysis(true);

    if (extractedText) {
      // For DOCX files, use the extracted text as input
      setInput(extractedText);
      // Use a mock event to trigger the submit handler
      const mockEvent = new Event('submit') as any;
      handleSubmit(mockEvent);
    } else {
      // TODO: Handle PDF files in the future
      console.log("Analyzing resume file:", file.name);
      // For now, show an error if we don't have extracted text
      alert("PDF analysis will be implemented soon.");
    }
  }

  const clearFile = () => {
    setFile(null)
    setExtractedText("")
    setIsValidResume(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Animation for the drop area when dragging
  const dropAreaClasses = cn(
    "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300 relative",
    {
      "border-primary bg-primary/5 scale-102 shadow-lg": isDragging,
      "border-gray-300 hover:border-primary bg-white hover:bg-gray-50/50 dark:bg-black dark:hover:border-primary dark:hover:bg-gray-900/70": !isDragging,
    },
  )

  // Animation for the file icon
  const fileIconClasses = cn("rounded-full p-3 transition-all duration-500", {
    "bg-primary/10 dark:bg-primary/5": !showSuccessAnimation && !showErrorAnimation,
    "bg-green-100 dark:bg-green-900/20": showSuccessAnimation,
    "bg-red-100 dark:bg-red-900/20": showErrorAnimation,
    "scale-110": isDragging || showSuccessAnimation || showErrorAnimation,
  })

  return (
    <Card className="w-full overflow-hidden border-0">
      <CardHeader>
        <CardTitle>Upload Your Resume</CardTitle>
        <CardDescription>
          Upload your resume in PDF or DOCX format to get personalized career recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={dropAreaRef}
          className={dropAreaClasses}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {file && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-6 w-6 rounded-full p-0 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          )}

          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.docx"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center gap-4">
            <div className={fileIconClasses}>
              {!file ? (
                <Upload
                  className={cn("h-6 w-6 text-primary transition-transform", {
                    "animate-bounce": isDragging,
                  })}
                />
              ) : (
                <File
                  className={cn("h-6 w-6 transition-colors", {
                    "text-primary": !showSuccessAnimation && !showErrorAnimation,
                    "text-green-600 dark:text-green-400": showSuccessAnimation,
                    "text-red-600 dark:text-red-400": showErrorAnimation,
                  })}
                />
              )}
            </div>
            <div>
              <p
                className={cn("font-medium transition-all", {
                  "text-primary": isDragging,
                })}
              >
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">PDF or DOCX (max. 10MB)</p>
            </div>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {(isUploading || (uploadProgress > 0 && uploadProgress < 100)) && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading file...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2 transition-all duration-300" />
          </div>
        )}

        {/* Success Alert */}
        {!isUploading && isValidResume === true && !showAnalysis && (
          <Alert
            className={cn("mt-4 border-green-500 bg-green-50 text-green-800 dark:bg-green-950/30 dark:border-green-700 dark:text-green-300 transition-all duration-500", {
              "shadow-md": showSuccessAnimation,
            })}
          >
            <CheckCircle
              className={cn("h-4 w-4", {
                "animate-in zoom-in-50 duration-300": showSuccessAnimation,
              })}
            />
            <AlertTitle
              className={cn({
                "animate-in slide-in-from-left-5 duration-300 delay-100": showSuccessAnimation,
              })}
            >
              Valid Resume Detected
            </AlertTitle>
            <AlertDescription
              className={cn({
                "animate-in slide-in-from-left-5 duration-300 delay-200": showSuccessAnimation,
              })}
            >
              Your file has been recognized as a resume. Click "Analyze" to proceed.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {!isUploading && isValidResume === false && (
          <Alert
            className={cn("mt-4 border-red-500 bg-red-50 text-red-800 dark:bg-red-950/30 dark:border-red-700 dark:text-red-300 transition-all duration-500", {
              "shadow-md": showErrorAnimation,
            })}
          >
            <AlertCircle
              className={cn("h-4 w-4", {
                "animate-in zoom-in-50 duration-300": showErrorAnimation,
              })}
            />
            <AlertTitle
              className={cn({
                "animate-in slide-in-from-left-5 duration-300 delay-100": showErrorAnimation,
              })}
            >
              Not a Resume
            </AlertTitle>
            <AlertDescription
              className={cn({
                "animate-in slide-in-from-left-5 duration-300 delay-200": showErrorAnimation,
              })}
            >
              The uploaded file does not appear to be a resume. Please upload a valid resume document.
            </AlertDescription>
          </Alert>
        )}

        {/* Analysis Results */}
        {showAnalysis && messages.length > 0 && (
          <div className="mt-4 space-y-4 animate-in fade-in-50 duration-300">
            <h3 className="text-lg font-medium">Resume Analysis</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {messages.map(message => (
                <div key={message.id} className={cn("p-4 rounded-lg", {
                  "bg-primary/10": message.role === 'user',
                  "bg-secondary": message.role === 'assistant'
                })}>
                  <p className="font-medium mb-1">{message.role === 'user' ? 'Your Resume:' : 'Analysis:'}</p>
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Status */}
        {showAnalysis && (status === 'submitted' || status === 'streaming') && (
          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm font-medium">
                  {status === 'submitted' ? 'Starting analysis...' : 'Analyzing your resume...'}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => stop()}>
                Cancel
              </Button>
            </div>
            {status === 'streaming' && (
              <Progress value={null} className="h-1 mt-4" />
            )}
          </div>
        )}

        {/* Analysis Error */}
        {showAnalysis && error && (
          <Alert className="mt-4 border-red-500 bg-red-50 text-red-800 dark:bg-red-950/30 dark:border-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>An error occurred while analyzing your resume.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => reload()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className={cn("w-full transition-all duration-300", {
            "bg-green-600 hover:bg-green-700": isValidResume === true && status !== 'streaming' && status !== 'submitted',
            "opacity-50": status === 'streaming' || status === 'submitted',
            "opacity-0": isUploading,
            "opacity-100": !isUploading,
          })}
          disabled={!isValidResume || isUploading || status === 'streaming' || status === 'submitted'}
          onClick={handleAnalyze}
        >
          {status === 'submitted' || status === 'streaming' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {status === 'submitted' ? 'Starting Analysis...' : 'Analyzing...'}
            </>
          ) : (
            <>
              <FileUp
                className={cn("mr-2 h-4 w-4", {
                  "animate-bounce": isValidResume === true && showSuccessAnimation,
                })}
              />
              Analyze Resume
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

