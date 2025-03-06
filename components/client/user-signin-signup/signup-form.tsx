"use client"

import type React from "react"
import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { object, string } from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Create signup-specific schema
const signupSchema = object({
  name: string({ required_error: "Name is required" })
    .min(4, "Name must be more than 4 characters")
    .max(50, "Name must be less than 50 characters"),
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
  confirmPassword: string({ required_error: "Confirm Password is required" })
    .min(1, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export function SignupForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      // Validate form data
      const validatedData = signupSchema.parse(formData)
      setIsLoading(true)

      // Send request to signup API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: validatedData.name,
          email: validatedData.email,
          password: validatedData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ form: data.message || "Failed to create account" })
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
      if (error instanceof Error) {
        // Check if it's a ZodError (has an issues property)
        if ('issues' in error) {
          const zodError = error as { issues: Array<{ path: string[], message: string }> }
          const fieldErrors: Record<string, string> = {}

          zodError.issues.forEach((issue) => {
            // The path is an array, but for simple objects the field name is the first element
            const fieldName = issue.path[0].toString()
            fieldErrors[fieldName] = issue.message
          })

          setErrors(fieldErrors)
        } else {
          // Handle other types of errors
          setErrors({ form: error.message })
        }
      } else {
        // Fallback for unknown error types
        setErrors({ form: 'An unknown error occurred' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
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
            {errors.form && (
              <div className="text-sm font-medium text-destructive">{errors.form}</div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
        </form>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>

        {/* Social Login Buttons */}
        <div className="grid gap-4 sm:grid-cols-1">
          <Button type="button" variant="outline" className="w-full" onClick={() => signIn("google")} disabled={isLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Google
          </Button>
        </div>
      </div>
    </div>
  )
}