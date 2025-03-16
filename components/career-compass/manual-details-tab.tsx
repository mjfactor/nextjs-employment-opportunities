"use client"

import type React from "react"
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trash2, Plus, AlertCircle, Briefcase, ArrowDown } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
// Import markdown renderer
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Switch } from "@/components/ui/switch"

interface JobExperience {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string
  description: string
}

interface FormErrors {
  courseInfo?: string
  skills?: string
  jobExperiences: {
    [key: string]: {
      title?: string
      company?: string
      startDate?: string
      endDate?: string
      description?: string
      dateRange?: string
    }
  }
}

const ManualDetailsTab = forwardRef(function ManualDetailsTab(props, ref) {
  const [courseInfo, setCourseInfo] = useState("")
  const [skills, setSkills] = useState("")
  const [hasJobExperience, setHasJobExperience] = useState(false)
  const [jobExperiences, setJobExperiences] = useState<JobExperience[]>([
    {
      id: "1",
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ])

  const [errors, setErrors] = useState<FormErrors>({
    jobExperiences: {},
  })
  const [touched, setTouched] = useState<{
    courseInfo: boolean
    skills: boolean
    jobExperiences: { [key: string]: { [field: string]: boolean } }
  }>({
    courseInfo: false,
    skills: false,
    jobExperiences: {},
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formValid, setFormValid] = useState(false)

  // Added states for analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string>("")
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // Ref to track if component is mounted
  const isMounted = useRef(true)

  // Add ref for abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Expose analyzing state and stopAnalysis function through ref
  useImperativeHandle(ref, () => ({
    isAnalyzing,
    isStreaming,
    stopAnalysis: () => stopAnalysis()
  }));

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Initialize touched state for job experiences
  useEffect(() => {
    const newTouched = { ...touched }

    jobExperiences.forEach((job) => {
      if (!newTouched.jobExperiences[job.id]) {
        newTouched.jobExperiences[job.id] = {
          title: false,
          company: false,
          startDate: false,
          endDate: false,
          description: false,
        }
      }
    })

    setTouched(newTouched)
  }, [jobExperiences])

  // Validate form on changes
  useEffect(() => {
    validateForm()
  }, [courseInfo, skills, jobExperiences, hasJobExperience])

  const validateForm = () => {
    const newErrors: FormErrors = {
      jobExperiences: {},
    }
    let isValid = true

    // Validate course info
    if (!courseInfo.trim()) {
      newErrors.courseInfo = "Course information is required"
      isValid = false
    }

    // Validate skills
    if (!skills.trim()) {
      newErrors.skills = "Skills are required"
      isValid = false
    }

    // Validate job experiences only if user has indicated they have job experience
    if (hasJobExperience) {
      jobExperiences.forEach((job) => {
        newErrors.jobExperiences[job.id] = {}

        if (!job.title.trim()) {
          newErrors.jobExperiences[job.id].title = "Job title is required"
          isValid = false
        }

        if (!job.company.trim()) {
          newErrors.jobExperiences[job.id].company = "Company name is required"
          isValid = false
        }

        if (!job.startDate) {
          newErrors.jobExperiences[job.id].startDate = "Start date is required"
          isValid = false
        }

        if (!job.endDate) {
          newErrors.jobExperiences[job.id].endDate = "End date is required"
          isValid = false
        }

        if (!job.description.trim()) {
          newErrors.jobExperiences[job.id].description = "Job description is required"
          isValid = false
        }

        // Validate date range if both dates are provided
        if (job.startDate && job.endDate) {
          const start = new Date(job.startDate)
          const end = new Date(job.endDate)

          if (start > end) {
            newErrors.jobExperiences[job.id].dateRange = "Start date must be before end date"
            isValid = false
          }
        }
      })
    }

    setErrors(newErrors)
    setFormValid(isValid)
    return isValid
  }

  const markFieldAsTouched = (field: string, jobId?: string, jobField?: string) => {
    if (jobId && jobField) {
      setTouched((prev) => ({
        ...prev,
        jobExperiences: {
          ...prev.jobExperiences,
          [jobId]: {
            ...prev.jobExperiences[jobId],
            [jobField]: true,
          },
        },
      }))
    } else {
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }))
    }
  }

  const isFieldTouched = (field: string, jobId?: string, jobField?: string) => {
    if (jobId && jobField) {
      return touched.jobExperiences[jobId]?.[jobField]
    }
    return touched[field as keyof typeof touched]
  }

  const getFieldError = (field: string, jobId?: string, jobField?: string) => {
    if (jobId && jobField) {
      return errors.jobExperiences[jobId]?.[jobField as keyof (typeof errors.jobExperiences)[typeof jobId]]
    }
    return errors[field as keyof typeof errors]
  }

  const addJobExperience = () => {
    setJobExperiences([
      ...jobExperiences,
      {
        id: Date.now().toString(),
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ])
  }

  const removeJobExperience = (id: string) => {
    if (jobExperiences.length > 1) {
      setJobExperiences(jobExperiences.filter((job) => job.id !== id))

      // Clean up errors and touched state for removed job
      const newErrors = { ...errors }
      delete newErrors.jobExperiences[id]
      setErrors(newErrors)

      const newTouched = { ...touched }
      delete newTouched.jobExperiences[id]
      setTouched(newTouched)
    }
  }

  const updateJobExperience = (id: string, field: keyof JobExperience, value: string) => {
    setJobExperiences(jobExperiences.map((job) => (job.id === id ? { ...job, [field]: value } : job)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    const allTouched: {
      courseInfo: boolean;
      skills: boolean;
      jobExperiences: { [key: string]: { [field: string]: boolean } };
    } = {
      courseInfo: true,
      skills: true,
      jobExperiences: {},
    }

    jobExperiences.forEach((job) => {
      allTouched.jobExperiences[job.id] = {
        title: true,
        company: true,
        startDate: true,
        endDate: true,
        description: true,
      }
    })

    setTouched(allTouched)

    // Validate form
    const isValid = validateForm()

    if (!isValid) {
      toast.error("Form Validation Error", {
        description: "Please fill in all required fields correctly.",
      })

      // Scroll to the first error
      const firstErrorElement = document.querySelector('[data-error="true"]')
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }

      return
    }

    // Handle form submission
    setIsSubmitting(true)
    setIsAnalyzing(true)
    setIsStreaming(true)
    setAnalysisResult("")
    setAnalysisError(null)

    try {
      // Debug logs for raw data
      console.log('--- MANUAL DETAILS FORM DATA (RAW) ---');
      console.log('Course Info:', courseInfo);
      console.log('Skills:', skills);
      console.log('Job Experiences:', jobExperiences);

      // Format manually entered data into a resume-like text format
      const formattedData = formatResumeData(courseInfo, skills, jobExperiences)

      // Debug log for formatted data
      console.log('--- FORMATTED TEXT FOR API ---');
      console.log(formattedData);

      // Create form data for the API request
      const formData = new FormData()
      formData.append('text', formattedData)

      // Create abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Make the API call with streaming response and abort signal
      const response = await fetch('/api/career-compass', {
        method: 'POST',
        body: formData,
        signal, // Add abort signal
      })

      if (!response.ok) {
        // Try to parse error response
        try {
          const errorData = await response.json()
          throw new Error(errorData.error || `Error: ${response.status}`)
        } catch (e) {
          throw new Error(`Error: ${response.status}`)
        }
      }

      // Read and process the streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("Response has no readable body")
      }

      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading

        if (value) {
          const chunk = decoder.decode(value, { stream: !done })
          if (isMounted.current) {
            setAnalysisResult(prev => prev + chunk)
          }
        }

        if (done) break
      }

      toast.success("Success!", {
        description: "Your details have been analyzed successfully.",
      })

    } catch (error) {
      // Check if this was an abort error
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Analysis was cancelled by the user');
      } else {
        console.error("Error analyzing data:", error)
        setAnalysisError(error instanceof Error ? error.message : 'An error occurred during analysis')

        toast.error("Analysis Failed", {
          description: "There was an error analyzing your details. Please try again.",
        })
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false)
        setIsAnalyzing(false)
        setIsStreaming(false)
      }
      // Clear the abort controller reference
      abortControllerRef.current = null;
    }
  }

  // Add a stopAnalysis function
  const stopAnalysis = () => {
    // Cancel any in-progress fetch when stopping analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (isMounted.current) {
      setIsAnalyzing(false);
      setIsStreaming(false);
    }
  };

  // Format the manually entered data into a resume-like text format
  const formatResumeData = (courseInfo: string, skills: string, jobs: JobExperience[]): string => {
    // Start building the formatted text
    let formattedText = "RESUME\n\n"

    // Education section
    formattedText += "EDUCATION\n"
    formattedText += courseInfo + "\n\n"

    // Skills section
    formattedText += "SKILLS\n"
    formattedText += skills + "\n\n"

    // Experience section - only include if user has job experience
    if (hasJobExperience && jobs.length > 0) {
      formattedText += "WORK EXPERIENCE\n"

      // Add each job
      jobs.forEach((job) => {
        // Format date range
        const startDate = new Date(job.startDate)
        const endDate = new Date(job.endDate)
        const formattedStartDate = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        const formattedEndDate = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

        formattedText += `${job.title} | ${job.company}\n`
        formattedText += `${formattedStartDate} - ${formattedEndDate}\n`
        formattedText += job.description + "\n\n"
      })
    } else {
      formattedText += "NO WORK EXPERIENCE\n\n"
    }

    return formattedText
  }

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-3">Enter Your Details Manually</h2>

        <div className="space-y-4">
          <div className="space-y-1.5" data-error={!!errors.courseInfo && isFieldTouched("courseInfo")}>
            <div className="flex justify-between items-center">
              <Label htmlFor="course-info" className="flex items-center gap-1 text-sm">
                Course Information
                <span className="text-red-500">*</span>
              </Label>
              {errors.courseInfo && isFieldTouched("courseInfo") && (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.courseInfo}
                </span>
              )}
            </div>
            <Textarea
              id="course-info"
              placeholder="Enter your educational background and courses"
              value={courseInfo}
              onChange={(e) => setCourseInfo(e.target.value)}
              onBlur={() => markFieldAsTouched("courseInfo")}
              className={`min-h-[80px] text-sm ${errors.courseInfo && isFieldTouched("courseInfo") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
          </div>

          <div className="space-y-1.5" data-error={!!errors.skills && isFieldTouched("skills")}>
            <div className="flex justify-between items-center">
              <Label htmlFor="skills" className="flex items-center gap-1 text-sm">
                Skills
                <span className="text-red-500">*</span>
              </Label>
              {errors.skills && isFieldTouched("skills") && (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.skills}
                </span>
              )}
            </div>
            <Textarea
              id="skills"
              placeholder="List your skills (e.g., JavaScript, Project Management, Data Analysis)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              onBlur={() => markFieldAsTouched("skills")}
              className={`min-h-[80px] text-sm ${errors.skills && isFieldTouched("skills") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
          </div>
        </div>
      </div>

      <Separator className="my-3" />

      {/* Job Experience Toggle */}
      <div className="flex items-center space-x-4 py-2">
        <Card className="w-full">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-medium">Work Experience</h3>
                  <p className="text-xs text-muted-foreground">Do you have any work experience to add?</p>
                </div>
              </div>
              <Switch
                checked={hasJobExperience}
                onCheckedChange={setHasJobExperience}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Experience Section - Only show if hasJobExperience is true */}
      <AnimatePresence>
        {hasJobExperience && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Job Experience</h3>
                <Button
                  type="button"
                  onClick={addJobExperience}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-xs h-7"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Job Experience
                </Button>
              </div>

              <div className="space-y-4">
                {jobExperiences.map((job, index) => {
                  const jobErrors = errors.jobExperiences[job.id] || {}

                  return (
                    <Card key={job.id} className="overflow-hidden">
                      <CardHeader className="p-3 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Job Experience {index + 1}</CardTitle>
                          {jobExperiences.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeJobExperience(job.id)}
                              className="h-6 w-6 p-0 text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          )}
                        </div>
                        <CardDescription className="text-xs">
                          Enter the details of your work experience
                          <span className="text-red-500 ml-1">*</span>
                        </CardDescription>

                        {jobErrors.dateRange && (
                          <Alert variant="destructive" className="mt-1.5 py-1.5 text-xs">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <AlertDescription className="text-xs">{jobErrors.dateRange}</AlertDescription>
                          </Alert>
                        )}
                      </CardHeader>

                      <CardContent className="p-3 pt-0 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div
                            className="space-y-1"
                            data-error={!!jobErrors.title && isFieldTouched("jobExperiences", job.id, "title")}
                          >
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`job-title-${job.id}`} className="flex items-center gap-1 text-xs">
                                Job Title
                                <span className="text-red-500">*</span>
                              </Label>
                              {jobErrors.title && isFieldTouched("jobExperiences", job.id, "title") && (
                                <span className="text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {jobErrors.title}
                                </span>
                              )}
                            </div>
                            <Input
                              id={`job-title-${job.id}`}
                              placeholder="e.g., Software Engineer"
                              value={job.title}
                              onChange={(e) => updateJobExperience(job.id, "title", e.target.value)}
                              onBlur={() => markFieldAsTouched("jobExperiences", job.id, "title")}
                              className={`h-8 text-sm ${jobErrors.title && isFieldTouched("jobExperiences", job.id, "title")
                                  ? "border-red-500 focus-visible:ring-red-500"
                                  : ""
                                }`}
                            />
                          </div>

                          <div
                            className="space-y-1"
                            data-error={!!jobErrors.company && isFieldTouched("jobExperiences", job.id, "company")}
                          >
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`company-${job.id}`} className="flex items-center gap-1 text-xs">
                                Company
                                <span className="text-red-500">*</span>
                              </Label>
                              {jobErrors.company && isFieldTouched("jobExperiences", job.id, "company") && (
                                <span className="text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {jobErrors.company}
                                </span>
                              )}
                            </div>
                            <Input
                              id={`company-${job.id}`}
                              placeholder="e.g., Acme Inc."
                              value={job.company}
                              onChange={(e) => updateJobExperience(job.id, "company", e.target.value)}
                              onBlur={() => markFieldAsTouched("jobExperiences", job.id, "company")}
                              className={`h-8 text-sm ${jobErrors.company && isFieldTouched("jobExperiences", job.id, "company")
                                  ? "border-red-500 focus-visible:ring-red-500"
                                  : ""
                                }`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div
                            className="space-y-1"
                            data-error={!!jobErrors.startDate && isFieldTouched("jobExperiences", job.id, "startDate")}
                          >
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`start-date-${job.id}`} className="flex items-center gap-1 text-xs">
                                Start Date
                                <span className="text-red-500">*</span>
                              </Label>
                              {jobErrors.startDate && isFieldTouched("jobExperiences", job.id, "startDate") && (
                                <span className="text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {jobErrors.startDate}
                                </span>
                              )}
                            </div>
                            <Input
                              id={`start-date-${job.id}`}
                              type="date"
                              value={job.startDate}
                              onChange={(e) => updateJobExperience(job.id, "startDate", e.target.value)}
                              onBlur={() => markFieldAsTouched("jobExperiences", job.id, "startDate")}
                              className={`h-8 text-sm ${jobErrors.startDate && isFieldTouched("jobExperiences", job.id, "startDate")
                                  ? "border-red-500 focus-visible:ring-red-500"
                                  : ""
                                }`}
                            />
                          </div>

                          <div
                            className="space-y-1"
                            data-error={!!jobErrors.endDate && isFieldTouched("jobExperiences", job.id, "endDate")}
                          >
                            <div className="flex justify-between items-center">
                              <Label htmlFor={`end-date-${job.id}`} className="flex items-center gap-1 text-xs">
                                End Date
                                <span className="text-red-500">*</span>
                              </Label>
                              {jobErrors.endDate && isFieldTouched("jobExperiences", job.id, "endDate") && (
                                <span className="text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {jobErrors.endDate}
                                </span>
                              )}
                            </div>
                            <Input
                              id={`end-date-${job.id}`}
                              type="date"
                              value={job.endDate}
                              onChange={(e) => updateJobExperience(job.id, "endDate", e.target.value)}
                              onBlur={() => markFieldAsTouched("jobExperiences", job.id, "endDate")}
                              className={`h-8 text-sm ${jobErrors.endDate && isFieldTouched("jobExperiences", job.id, "endDate")
                                  ? "border-red-500 focus-visible:ring-red-500"
                                  : ""
                                }`}
                            />
                          </div>
                        </div>

                        <div
                          className="space-y-1"
                          data-error={!!jobErrors.description && isFieldTouched("jobExperiences", job.id, "description")}
                        >
                          <div className="flex justify-between items-center">
                            <Label htmlFor={`description-${job.id}`} className="flex items-center gap-1 text-xs">
                              Job Description
                              <span className="text-red-500">*</span>
                            </Label>
                            {jobErrors.description && isFieldTouched("jobExperiences", job.id, "description") && (
                              <span className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {jobErrors.description}
                              </span>
                            )}
                          </div>
                          <Textarea
                            id={`description-${job.id}`}
                            placeholder="Describe your responsibilities and achievements"
                            value={job.description}
                            onChange={(e) => updateJobExperience(job.id, "description", e.target.value)}
                            onBlur={() => markFieldAsTouched("jobExperiences", job.id, "description")}
                            className={`min-h-[60px] text-sm ${jobErrors.description && isFieldTouched("jobExperiences", job.id, "description") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {!formValid &&
            Object.keys(errors).some(
              (key) =>
                (key === "courseInfo" && errors.courseInfo) ||
                (key === "skills" && errors.skills) ||
                (key === "jobExperiences" && Object.keys(errors.jobExperiences).length > 0),
            ) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="py-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">Please fill in all required fields marked with an asterisk (*).</AlertDescription>
                </Alert>
              </motion.div>
            )}
        </AnimatePresence>

        <div className="flex justify-end">
          <Button type="submit" size="sm" className="rounded-lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2">{isStreaming ? "Analyzing..." : "Submitting..."}</span>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </>
            ) : (
              "Submit Details"
            )}
          </Button>
        </div>
      </div>

      {/* Analysis Results Section - Display when streaming or has content */}
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

            {/* Markdown rendering component */}
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
    </form>
  )
});

export default ManualDetailsTab;

