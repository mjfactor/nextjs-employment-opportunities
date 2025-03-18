"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Mail, Lock, User, Github, ChromeIcon as Google, Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signupSchema } from "@/lib/validations/auth"
import { signUp } from "@/lib/actions/register"

interface AuthModalProps {
  mode: "login" | "signup"
  children?: React.ReactNode
  className?: string
}

export default function AuthModal({ mode, children, className }: AuthModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">(mode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
        setError(error.message)
      }
    } else {
      setError('An unknown error occurred')
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setIsSubmitting(false)
        return
      }

      // Successful login - redirect to dashboard or home
      setOpen(false)
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setErrors({})
    setIsSubmitting(true)

    try {
      // Validate form data using imported schema
      const validatedData = signupSchema.parse({
        name,
        email,
        password,
        confirmPassword,
      })

      // Call the signup API
      const result = await signUp({
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
      })

      if (!result.success) {
        setError(result.error || "Failed to create account")
        setIsSubmitting(false)
        return
      }

      // Automatically sign in after successful registration
      await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      })

      setOpen(false)
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      handleValidationErrors(error)
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
    setIsGoogleLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={className}>
        {children || (
          <Button
            variant={mode === "login" ? "outline" : "default"}
            className={
              mode === "login"
                ? "border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white"
                : "bg-green-600 hover:bg-green-700"
            }
          >
            {mode === "login" ? "Sign In" : "Sign Up"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black border border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {authMode === "login" ? "Welcome back" : "Create an account"}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue={mode}
          className="w-full"
          onValueChange={(value) => setAuthMode(value as "login" | "signup")}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-zinc-900">
            <TabsTrigger value="login" className="data-[state=active]:bg-zinc-800">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-zinc-800">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-800 bg-red-950 text-red-500">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login" className="text-sm text-zinc-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="email-login"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-zinc-900 border-zinc-700 text-white focus:border-green-500"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password-login" className="text-sm text-zinc-300">
                    Password
                  </Label>
                  <Button variant="link" className="p-0 h-auto text-xs text-green-500">
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="password-login"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-zinc-900 border-zinc-700 text-white focus:border-green-500"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7 text-zinc-500 hover:text-zinc-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing In...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-black px-2 text-zinc-400">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button
                variant="outline"
                className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
              >
                <Google className="mr-2 h-4 w-4" />
                {isGoogleLoading ? "Signing in..." : "Google"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-800 bg-red-950 text-red-500">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name-signup" className="text-sm text-zinc-300">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="name-signup"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10 bg-zinc-900 border-zinc-700 text-white focus:border-green-500"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-signup" className="text-sm text-zinc-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 bg-zinc-900 border-zinc-700 text-white focus:border-green-500"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-signup" className="text-sm text-zinc-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="password-signup"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-zinc-900 border-zinc-700 text-white focus:border-green-500"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7 text-zinc-500 hover:text-zinc-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password-signup" className="text-sm text-zinc-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="confirm-password-signup"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-zinc-900 border-zinc-700 text-white focus:border-green-500"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7 text-zinc-500 hover:text-zinc-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-black px-2 text-zinc-400">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Button
                variant="outline"
                className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
              >
                <Google className="mr-2 h-4 w-4" />
                {isGoogleLoading ? "Signing in..." : "Google"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

