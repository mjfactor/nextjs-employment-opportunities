"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface JobExperience {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string
  description: string
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
    }
  }

  const updateJobExperience = (id: string, field: keyof JobExperience, value: string) => {
    setJobExperiences(jobExperiences.map((job) => (job.id === id ? { ...job, [field]: value } : job)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log({ courseInfo, skills, jobExperiences })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-6">Enter Your Details Manually</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="course-info">Course Information</Label>
            <Textarea
              id="course-info"
              placeholder="Enter your educational background and courses"
              value={courseInfo}
              onChange={(e) => setCourseInfo(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Textarea
              id="skills"
              placeholder="List your skills (e.g., JavaScript, Project Management, Data Analysis)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="min-h-[100px]"
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
          {jobExperiences.map((job, index) => (
            <Card key={job.id} className="border border-gray-200">
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
                <CardDescription>Enter the details of your work experience</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`job-title-${job.id}`}>Job Title</Label>
                    <Input
                      id={`job-title-${job.id}`}
                      placeholder="e.g., Software Engineer"
                      value={job.title}
                      onChange={(e) => updateJobExperience(job.id, "title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`company-${job.id}`}>Company</Label>
                    <Input
                      id={`company-${job.id}`}
                      placeholder="e.g., Acme Inc."
                      value={job.company}
                      onChange={(e) => updateJobExperience(job.id, "company", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`start-date-${job.id}`}>Start Date</Label>
                    <Input
                      id={`start-date-${job.id}`}
                      type="date"
                      value={job.startDate}
                      onChange={(e) => updateJobExperience(job.id, "startDate", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`end-date-${job.id}`}>End Date</Label>
                    <Input
                      id={`end-date-${job.id}`}
                      type="date"
                      value={job.endDate}
                      onChange={(e) => updateJobExperience(job.id, "endDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${job.id}`}>Job Description</Label>
                  <Textarea
                    id={`description-${job.id}`}
                    placeholder="Describe your responsibilities and achievements"
                    value={job.description}
                    onChange={(e) => updateJobExperience(job.id, "description", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="mt-4">
          Submit Details
        </Button>
      </div>
    </form>
  )
}

