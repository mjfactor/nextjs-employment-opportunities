"use client"

import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { GalleryVerticalEnd } from "lucide-react"
import type React from "react"

// Schema and utilities
import { signupSchema } from "@/lib/validations/auth"
import { cn } from "@/lib/utils"
import { signUp } from "@/lib/actions/register"
// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Form field configuration for easy maintenance
const formFields = [
  { id: "name", label: "Name", type: "text", placeholder: "" },
  { id: "email", label: "Email", type: "email", placeholder: "m@example.com" },
  { id: "password", label: "Password", type: "password", placeholder: "" },
  { id: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "" },
]

export function SignupForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleValidationErrors = (error: unknown) => {
    if (error instanceof Error) {
      // Check if it's a ZodError (has an issues property)
      if ('issues' in error) {
        const zodError = error as { issues: Array<{ path: string[], message: string }> }
        const fieldErrors: Record<string, string> = {}

        zodError.issues.forEach((issue) => {
          const fieldName = issue.path[0].toString()
          fieldErrors[fieldName] = issue.message
        })

        setErrors(fieldErrors)
      } else {
        setErrors({ form: error.message })
      }
    } else {
      setErrors({ form: 'An unknown error occurred' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      // Validate form data using imported schema
      const validatedData = signupSchema.parse(formData)
      setIsLoading(true)

      // Call the signup API
      const result = await signUp({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
      })

      if (!result.success) {
        setErrors({ form: result.error || "Failed to create account" })
        return
      }

      // Redirect to signin or automatically sign in
      await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: true,
        callbackUrl: "/dashboard"
      })
    } catch (error) {
      handleValidationErrors(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    await signIn("google");
    setIsGoogleLoading(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-2">
          <Link href="/" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <span className="sr-only">Acme Inc.</span>
          </Link>
          <h1 className="text-xl font-bold">Create an account</h1>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Button variant="link" className="p-0 h-auto font-normal" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
          </div>
        </div>

        {/* Email/Password Signup Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            {/* Form error message */}
            {errors.form && (
              <div className="text-sm font-medium text-red-500">{errors.form}</div>
            )}

            {/* Form fields generated from configuration */}
            {formFields.map((field) => (
              <div key={field.id} className="grid gap-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.id as keyof typeof formData]}
                  onChange={handleChange}
                  required
                />
                {errors[field.id] && (
                  <p className="text-sm text-red-500 font-bold">{errors[field.id]}</p>
                )}
              </div>
            ))}

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>

        {/* Social Login Buttons */}
        <div className="grid gap-4 sm:grid-cols-1">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            {isGoogleLoading ? "Signing in..." : "Google"}
          </Button>
        </div>
      </div>
    </div>
  )
}