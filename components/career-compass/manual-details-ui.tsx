import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trash2, Plus, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"

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

interface ManualDetailsUIProps {
    courseInfo: string
    skills: string
    jobExperiences: JobExperience[]
    errors: FormErrors
    isFieldTouched: (field: string, jobId?: string, jobField?: string) => boolean
    markFieldAsTouched: (field: string, jobId?: string, jobField?: string) => void
    formValid: boolean
    isSubmitting: boolean
    onCourseInfoChange: (value: string) => void
    onSkillsChange: (value: string) => void
    onAddJobExperience: () => void
    onRemoveJobExperience: (id: string) => void
    onUpdateJobExperience: (id: string, field: keyof JobExperience, value: string) => void
    onSubmit: (e: React.FormEvent) => Promise<void>
}

export default function ManualDetailsUI({
    courseInfo,
    skills,
    jobExperiences,
    errors,
    isFieldTouched,
    markFieldAsTouched,
    formValid,
    isSubmitting,
    onCourseInfoChange,
    onSkillsChange,
    onAddJobExperience,
    onRemoveJobExperience,
    onUpdateJobExperience,
    onSubmit
}: ManualDetailsUIProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-8">
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
                            onChange={(e) => onCourseInfoChange(e.target.value)}
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
                            onChange={(e) => onSkillsChange(e.target.value)}
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
                        onClick={onAddJobExperience}
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
                            <Card key={job.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Job Experience {index + 1}</CardTitle>
                                        {jobExperiences.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onRemoveJobExperience(job.id)}
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
                                                onChange={(e) => onUpdateJobExperience(job.id, "title", e.target.value)}
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
                                                onChange={(e) => onUpdateJobExperience(job.id, "company", e.target.value)}
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
                                                onChange={(e) => onUpdateJobExperience(job.id, "startDate", e.target.value)}
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
                                                onChange={(e) => onUpdateJobExperience(job.id, "endDate", e.target.value)}
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
                                            onChange={(e) => onUpdateJobExperience(job.id, "description", e.target.value)}
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
