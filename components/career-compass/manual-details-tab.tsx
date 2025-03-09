"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trash2, Plus, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

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

export default function ManualDetailsTab() {
  const [courseInfo, setCourseInfo] = useState("")
  const [skills, setSkills] = useState("")
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
  }, [courseInfo, skills, jobExperiences])

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

    // Validate job experiences
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
      courseInfo: boolean
      skills: boolean
      jobExperiences: {
        [key: string]: {
          title: boolean
          company: boolean
          startDate: boolean
          endDate: boolean
          description: boolean
        }
      }
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

    // Simulate form submission
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Handle form submission
      console.log({ courseInfo, skills, jobExperiences })

      toast.success("Success!", {
        description: "Your details have been submitted successfully.",
      })

      // Reset form or redirect
    } catch (error) {
      toast.error("Submission Failed", {
        description: "There was an error submitting your details. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-6">Enter Your Details Manually</h2>

        <div className="space-y-6">
          <div className="space-y-2" data-error={!!errors.courseInfo && isFieldTouched("courseInfo")}>
            <div className="flex justify-between items-center">
              <Label htmlFor="course-info" className="flex items-center gap-1">
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
              className={`min-h-[100px] ${errors.courseInfo && isFieldTouched("courseInfo") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
          </div>

          <div className="space-y-2" data-error={!!errors.skills && isFieldTouched("skills")}>
            <div className="flex justify-between items-center">
              <Label htmlFor="skills" className="flex items-center gap-1">
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
              className={`min-h-[100px] ${errors.skills && isFieldTouched("skills") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Job Experience</h3>
          <Button
            type="button"
            onClick={addJobExperience}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Job Experience
          </Button>
        </div>

        <div className="space-y-6">
          {jobExperiences.map((job, index) => {
            const jobErrors = errors.jobExperiences[job.id] || {}

            return (
              <Card
                key={job.id}
                
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Job Experience {index + 1}</CardTitle>
                    {jobExperiences.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeJobExperience(job.id)}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    Enter the details of your work experience
                    <span className="text-red-500 ml-1">*</span>
                  </CardDescription>

                  {jobErrors.dateRange && (
                    <Alert variant="destructive" className="mt-2 py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{jobErrors.dateRange}</AlertDescription>
                    </Alert>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className="space-y-2"
                      data-error={!!jobErrors.title && isFieldTouched("jobExperiences", job.id, "title")}
                    >
                      <div className="flex justify-between items-center">
                        <Label htmlFor={`job-title-${job.id}`} className="flex items-center gap-1">
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
                        className={
                          jobErrors.title && isFieldTouched("jobExperiences", job.id, "title")
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      />
                    </div>

                    <div
                      className="space-y-2"
                      data-error={!!jobErrors.company && isFieldTouched("jobExperiences", job.id, "company")}
                    >
                      <div className="flex justify-between items-center">
                        <Label htmlFor={`company-${job.id}`} className="flex items-center gap-1">
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
                        className={
                          jobErrors.company && isFieldTouched("jobExperiences", job.id, "company")
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className="space-y-2"
                      data-error={!!jobErrors.startDate && isFieldTouched("jobExperiences", job.id, "startDate")}
                    >
                      <div className="flex justify-between items-center">
                        <Label htmlFor={`start-date-${job.id}`} className="flex items-center gap-1">
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
                        className={
                          jobErrors.startDate && isFieldTouched("jobExperiences", job.id, "startDate")
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      />
                    </div>

                    <div
                      className="space-y-2"
                      data-error={!!jobErrors.endDate && isFieldTouched("jobExperiences", job.id, "endDate")}
                    >
                      <div className="flex justify-between items-center">
                        <Label htmlFor={`end-date-${job.id}`} className="flex items-center gap-1">
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
                        className={
                          jobErrors.endDate && isFieldTouched("jobExperiences", job.id, "endDate")
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      />
                    </div>
                  </div>

                  <div
                    className="space-y-2"
                    data-error={!!jobErrors.description && isFieldTouched("jobExperiences", job.id, "description")}
                  >
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`description-${job.id}`} className="flex items-center gap-1">
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
                      className={`min-h-[100px] ${jobErrors.description && isFieldTouched("jobExperiences", job.id, "description") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
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
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Please fill in all required fields marked with an asterisk (*).</AlertDescription>
                </Alert>
              </motion.div>
            )}
        </AnimatePresence>

        <div className="flex justify-end">
          <Button type="submit" className="mt-4" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2">Submitting...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </>
            ) : (
              "Submit Details"
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

