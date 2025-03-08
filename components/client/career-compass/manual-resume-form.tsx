"use client"

import type React from "react"

import { useState } from "react"
import { PlusCircle, MinusCircle, Briefcase, GraduationCap, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

type JobExperience = {
    id: string
    company: string
    position: string
    startDate: string
    endDate: string
    description: string
}

type ManualResumeFormProps = {
    onSubmit: (data: {
        education: string
        skills: string
        jobExperiences: JobExperience[]
    }) => void
}

export function ManualResumeForm({ onSubmit }: ManualResumeFormProps) {
    const [education, setEducation] = useState("")
    const [skills, setSkills] = useState("")
    const [jobExperiences, setJobExperiences] = useState<JobExperience[]>([
        {
            id: "job-1",
            company: "",
            position: "",
            startDate: "",
            endDate: "",
            description: "",
        },
    ])

    const addJobExperience = () => {
        setJobExperiences([
            ...jobExperiences,
            {
                id: `job-${jobExperiences.length + 1}`,
                company: "",
                position: "",
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
        onSubmit({
            education,
            skills,
            jobExperiences,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-6">
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center">
                        <GraduationCap className="mr-2 h-5 w-5 text-primary" />
                        <Label htmlFor="education" className="text-base font-medium">
                            Education/Course
                        </Label>
                    </div>
                    <Textarea
                        id="education"
                        placeholder="Enter your educational background (e.g., Bachelor's in Computer Science, University of Technology)"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        required
                        className="min-h-[100px] resize-y"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center">
                        <Code className="mr-2 h-5 w-5 text-primary" />
                        <Label htmlFor="skills" className="text-base font-medium">
                            Skills
                        </Label>
                    </div>
                    <Textarea
                        id="skills"
                        placeholder="List your skills (e.g., JavaScript, React, Node.js, Project Management)"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        required
                        className="min-h-[100px] resize-y"
                    />
                </div>

                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Briefcase className="mr-2 h-5 w-5 text-primary" />
                            <Label className="text-base font-medium">Job Experience</Label>
                        </div>
                        <Button type="button" variant="outline" onClick={addJobExperience} className="gap-1">
                            <PlusCircle className="h-4 w-4" />
                            Add Experience
                        </Button>
                    </div>

                    {jobExperiences.map((job, index) => (
                        <Card key={job.id} className="border border-muted shadow-sm">
                            <CardContent className="pt-6 pb-4 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor={`company-${job.id}`}>Company</Label>
                                        <Input
                                            id={`company-${job.id}`}
                                            placeholder="Company name"
                                            value={job.company}
                                            onChange={(e) => updateJobExperience(job.id, "company", e.target.value)}
                                            required={index === 0}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`position-${job.id}`}>Position</Label>
                                        <Input
                                            id={`position-${job.id}`}
                                            placeholder="Job title"
                                            value={job.position}
                                            onChange={(e) => updateJobExperience(job.id, "position", e.target.value)}
                                            required={index === 0}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor={`start-date-${job.id}`}>Start Date</Label>
                                        <Input
                                            id={`start-date-${job.id}`}
                                            type="date"
                                            value={job.startDate}
                                            onChange={(e) => updateJobExperience(job.id, "startDate", e.target.value)}
                                            required={index === 0}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`end-date-${job.id}`}>End Date</Label>
                                        <Input
                                            id={`end-date-${job.id}`}
                                            type="date"
                                            value={job.endDate}
                                            onChange={(e) => updateJobExperience(job.id, "endDate", e.target.value)}
                                            required={index === 0}
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
                                        required={index === 0}
                                        className="min-h-[120px] resize-y"
                                    />
                                </div>
                            </CardContent>

                            {index > 0 && (
                                <CardFooter className="flex justify-end py-3 bg-muted/10">
                                    <Button type="button" variant="destructive" size="sm" onClick={() => removeJobExperience(job.id)}>
                                        <MinusCircle className="mr-2 h-4 w-4" />
                                        Remove
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    ))}
                </div>
            </div>

            <Button type="submit" className="w-full">
                Submit Details
            </Button>
        </form>
    )
}

