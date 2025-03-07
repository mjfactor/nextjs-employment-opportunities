"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileText, Image, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// Allowed file types and maximum size (10MB)
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/gif",
]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

type FileStatus = "idle" | "loading" | "success" | "error"

type ResumeUploaderProps = {
  onFileSelect: (file: File) => void
  onSubmit?: (file: File) => void
  className?: string
}

export function ResumeUploader({ onFileSelect, onSubmit, className }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<FileStatus>("idle")
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropzoneRef = useRef<HTMLDivElement>(null)

  // Simulate upload progress
  const simulateProgress = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setStatus("success")
          return 100
        }
        return prev + 5
      })
    }, 100)
    return interval
  }

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError("Invalid file type. Please upload a PDF, DOCX, or image file (JPEG, PNG, GIF).")
      return false
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds the 10MB limit.")
      return false
    }

    return true
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === "loading") return // Prevent new upload while one is in progress

    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setError(null)

    if (validateFile(selectedFile)) {
      setFile(selectedFile)
      setStatus("loading")

      const interval = simulateProgress()

      // Simulate processing time
      setTimeout(() => {
        clearInterval(interval)
        setProgress(100)
        setStatus("success")
        onFileSelect(selectedFile)
      }, 2000)
    } else {
      setStatus("error")
      setFile(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (status === "loading") return // Prevent new upload while one is in progress

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      setError(null)

      if (validateFile(droppedFile)) {
        setFile(droppedFile)
        setStatus("loading")

        const interval = simulateProgress()

        // Simulate processing time
        setTimeout(() => {
          clearInterval(interval)
          setProgress(100)
          setStatus("success")
          onFileSelect(droppedFile)
        }, 2000)
      } else {
        setStatus("error")
        setFile(null)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleReset = () => {
    setFile(null)
    setError(null)
    setStatus("idle")
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getFileIcon = () => {
    if (!file) return <Upload className="h-10 w-10 text-muted-foreground" />

    if (file.type.includes("image")) {
      return <Image className="h-10 w-10 text-primary" />
    }

    return <FileText className="h-10 w-10 text-primary" />
  }

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <Check className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      default:
        return null
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={dropzoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          status === "error" ? "border-destructive bg-destructive/10" : "border-muted-foreground/25 hover:bg-accent",
          status === "success" ? "border-green-500/50 bg-green-500/10" : "",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.jpeg,.jpg,.png,.gif"
          onChange={handleFileChange}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={status === "loading"}
        />

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center">
            {getFileIcon()}
            {status !== "idle" && <div className="ml-2">{getStatusIcon()}</div>}
          </div>

          {file ? (
            <div className="mt-2 flex flex-col items-center">
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="mt-2 space-y-1">
              <p className="font-medium">Drag and drop your resume or click to browse</p>
              <p className="text-xs text-muted-foreground">Accepts PDF, DOCX, JPEG, PNG, GIF (Max 10MB)</p>
            </div>
          )}

          {status === "loading" && (
            <div className="mt-4 w-full max-w-xs">
              <Progress value={progress} className="h-2" />
              <p className="mt-1 text-xs text-center text-muted-foreground">Uploading... {progress}%</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-destructive flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        {(status === "success" || status === "error") && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}

        {status === "success" && file && (
          <Button variant="default" size="sm" className="ml-2 bg-primary" onClick={() => onSubmit && onSubmit(file)}>
            <Check className="mr-2 h-4 w-4" />
            Submit Resume
          </Button>
        )}
      </div>
    </div>
  )
}

