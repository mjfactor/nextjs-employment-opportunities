"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import ManualDetailsUI from "./manual-details-ui"

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

  const isFieldTouched = (field: string, jobId?: string, jobField?: string): boolean => {
    if (jobId && jobField) {
      return !!touched.jobExperiences[jobId]?.[jobField]
    }
    return !!touched[field as keyof typeof touched]
  }

  const handleCourseInfoChange = (value: string) => {
    setCourseInfo(value)
  }

  const handleSkillsChange = (value: string) => {
    setSkills(value)
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
    <ManualDetailsUI
      courseInfo={courseInfo}
      skills={skills}
      jobExperiences={jobExperiences}
      errors={errors}
      isFieldTouched={isFieldTouched}
      markFieldAsTouched={markFieldAsTouched}
      formValid={formValid}
      isSubmitting={isSubmitting}
      onCourseInfoChange={handleCourseInfoChange}
      onSkillsChange={handleSkillsChange}
      onAddJobExperience={addJobExperience}
      onRemoveJobExperience={removeJobExperience}
      onUpdateJobExperience={updateJobExperience}
      onSubmit={handleSubmit}
    />
  )
}

