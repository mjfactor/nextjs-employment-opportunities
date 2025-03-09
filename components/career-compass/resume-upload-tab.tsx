"use client"

import type React from "react"
import { useState, useEffect } from "react"
import ResumeUploadUI from "./resume-upload-ui"

export default function ResumeUploadTab() {
  // File-related state
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Upload and validation state
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStage, setUploadStage] = useState<"idle" | "uploading" | "validating" | "complete">("idle")
  const [isValidating, setIsValidating] = useState(false)
  const [isValidResume, setIsValidResume] = useState<boolean | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // File handling functions
  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile)
    setIsValidResume(null)

    // Create file preview if it's a text file
    if (selectedFile.type === "text/plain") {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string)
      }
      reader.readAsText(selectedFile)
    } else {
      setFilePreview(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      handleFileSelection(selectedFile)
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

  const removeFile = () => {
    setFile(null)
    setFilePreview(null)
    setIsValidResume(null)
    setUploadStage("idle")
    setUploadProgress(0)
  }

  // Upload and validation functions
  const simulateUploadProgress = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 3 * 10
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setUploadProgress(100)
        setUploadStage("validating")
        validateResume()
      } else {
        setUploadProgress(progress)
      }
    }, 200)
  }

  const validateResume = async () => {
    if (!file) return

    setIsValidating(true)
    setUploadStage("validating")

    // Create FormData and append file
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch("/api/validate-resume", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const result = await response.json();
      const isValid = result.isValid;

      setIsValidResume(isValid);
      setIsValidating(false);
      setUploadStage("complete");

      if (isValid) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (error) {
      console.error("Resume validation failed:", error);
      setIsValidResume(false);
      setIsValidating(false);
      setUploadStage("complete");
    }
  }

  const handleSubmit = () => {
    alert("Resume submitted successfully!")
  }

  // Effects
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

  return (
    <ResumeUploadUI
      file={file}
      filePreview={filePreview}
      isDragging={isDragging}
      isValidating={isValidating}
      isValidResume={isValidResume}
      uploadProgress={uploadProgress}
      uploadStage={uploadStage}
      showConfetti={showConfetti}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onFileChange={handleFileChange}
      onRemoveFile={removeFile}
      onSubmit={handleSubmit}
    />
  )
}

