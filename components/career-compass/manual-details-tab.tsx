"use client"

import type React from "react"

import { useState } from "react"
import { PlusCircle, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

interface JobExperience {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string
  description: string
}

export function ManualDataEntry() {
  const [courses, setCourses] = useState("")
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

    // Validate required fields
    if (!courses.trim()) {
      alert("Please enter your courses")
      return
    }

    if (!skills.trim()) {
      alert("Please enter your skills")
      return
    }

    // In a real app, this would submit the data to an API
    alert("Data submitted successfully!")
    console.log({ courses, skills, jobExperiences })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manual Data Entry</CardTitle>
        <CardDescription>Enter your educational background and professional experience</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Courses Section */}
          <div className="space-y-2">
            <Label htmlFor="courses" className="text-base font-medium">
              Courses <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="courses"
              placeholder="List your relevant courses, separated by commas"
              value={courses}
              onChange={(e) => setCourses(e.target.value)}
              className="min-h-[100px]"
              required
            />
            <p className="text-sm text-muted-foreground">Example: Web Development, Data Structures, Machine Learning</p>
          </div>

          {/* Skills Section */}
          <div className="space-y-2">
            <Label htmlFor="skills" className="text-base font-medium">
              Skills <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="skills"
              placeholder="List your skills, separated by commas"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="min-h-[100px]"
              required
            />
            <p className="text-sm text-muted-foreground">Example: JavaScript, React, Node.js, Project Management</p>
          </div>

          {/* Job Experiences Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Job Experiences (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addJobExperience}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
              </Button>
            </div>

            {jobExperiences.map((job, index) => (
              <div key={job.id} className="space-y-4 pt-4">
                {index > 0 && <Separator className="mb-4" />}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`job-title-${job.id}`}>Job Title</Label>
                    <Input
                      id={`job-title-${job.id}`}
                      placeholder="Software Engineer"
                      value={job.title}
                      onChange={(e) => updateJobExperience(job.id, "title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`company-${job.id}`}>Company</Label>
                    <Input
                      id={`company-${job.id}`}
                      placeholder="Acme Inc."
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
                  <Label htmlFor={`description-${job.id}`}>Description</Label>
                  <Textarea
                    id={`description-${job.id}`}
                    placeholder="Describe your responsibilities and achievements"
                    value={job.description}
                    onChange={(e) => updateJobExperience(job.id, "description", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                {jobExperiences.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeJobExperience(job.id)}
                    className="mt-4"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" /> Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" /> Submit
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

