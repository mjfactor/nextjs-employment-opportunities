"use client"

import type React from "react"
import { useState } from "react"
import { PlusCircle, Save, Briefcase, Building, Calendar, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

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
    <Card className="w-full border-none shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Manual Data Entry
        </CardTitle>
        <CardDescription>Enter your educational background and professional experience</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-8">
          {/* Courses Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Courses</h3>
              <span className="text-xs font-medium text-white bg-primary/80 px-2 py-0.5 rounded-full">Required</span>
            </div>
            <Textarea
              id="courses"
              placeholder="List your relevant courses, separated by commas"
              value={courses}
              onChange={(e) => setCourses(e.target.value)}
              className="min-h-[100px] border-primary/20 focus:border-primary/50 transition-all duration-300"
              required
            />
            <p className="text-sm text-muted-foreground">Example: Web Development, Data Structures, Machine Learning</p>
          </div>

          {/* Skills Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Skills</h3>
              <span className="text-xs font-medium text-white bg-primary/80 px-2 py-0.5 rounded-full">Required</span>
            </div>
            <Textarea
              id="skills"
              placeholder="List your skills, separated by commas"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="min-h-[100px] border-primary/20 focus:border-primary/50 transition-all duration-300"
              required
            />
            <p className="text-sm text-muted-foreground">Example: JavaScript, React, Node.js, Project Management</p>
          </div>

          {/* Job Experiences Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Job Experiences</h3>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addJobExperience}
                className="gap-1.5 border-dashed hover:bg-primary/5 transition-colors"
              >
                <PlusCircle className="h-4 w-4" /> Add Experience
              </Button>
            </div>

            {jobExperiences.map((job, index) => (
              <Card
                key={job.id}
                className={cn(
                  "border border-primary/10 shadow-sm overflow-hidden transition-all duration-300",
                  "hover:border-primary/20 hover:shadow-md",
                )}
              >
                <CardHeader className="bg-muted/30 pb-3 pt-4 px-5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary/70" />
                      <h4 className="font-medium">Job Experience {index + 1}</h4>
                    </div>
                    {jobExperiences.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeJobExperience(job.id)}
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Remove job experience"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`job-title-${job.id}`} className="flex items-center gap-1.5 text-sm font-medium">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" /> Job Title
                      </Label>
                      <Input
                        id={`job-title-${job.id}`}
                        placeholder="Software Engineer"
                        value={job.title}
                        onChange={(e) => updateJobExperience(job.id, "title", e.target.value)}
                        className="border-primary/20 focus:border-primary/50 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`company-${job.id}`} className="flex items-center gap-1.5 text-sm font-medium">
                        <Building className="h-3.5 w-3.5 text-muted-foreground" /> Company
                      </Label>
                      <Input
                        id={`company-${job.id}`}
                        placeholder="Acme Inc."
                        value={job.company}
                        onChange={(e) => updateJobExperience(job.id, "company", e.target.value)}
                        className="border-primary/20 focus:border-primary/50 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`start-date-${job.id}`} className="flex items-center gap-1.5 text-sm font-medium">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Start Date
                      </Label>
                      <Input
                        id={`start-date-${job.id}`}
                        type="date"
                        value={job.startDate}
                        onChange={(e) => updateJobExperience(job.id, "startDate", e.target.value)}
                        className="border-primary/20 focus:border-primary/50 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`end-date-${job.id}`} className="flex items-center gap-1.5 text-sm font-medium">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> End Date
                      </Label>
                      <Input
                        id={`end-date-${job.id}`}
                        type="date"
                        value={job.endDate}
                        onChange={(e) => updateJobExperience(job.id, "endDate", e.target.value)}
                        className="border-primary/20 focus:border-primary/50 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${job.id}`} className="flex items-center gap-1.5 text-sm font-medium">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Description
                    </Label>
                    <Textarea
                      id={`description-${job.id}`}
                      placeholder="Describe your responsibilities and achievements"
                      value={job.description}
                      onChange={(e) => updateJobExperience(job.id, "description", e.target.value)}
                      className="min-h-[100px] border-primary/20 focus:border-primary/50 transition-all duration-300"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>

        <Separator className="my-2" />

        <CardFooter className="p-6 bg-gray-50 rounded-b-lg">
          <Button
            type="submit"
            className="w-full sm:w-auto ml-auto gap-2 shadow-md transition-all duration-300 hover:shadow-lg"
          >
            <Save className="h-4 w-4" /> Submit Application
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

