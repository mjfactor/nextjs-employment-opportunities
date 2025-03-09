import { z } from "zod"

export const signupSchema = z.object({
    name: z.string({ required_error: "Name is required" })
        .min(4, "Name must be more than 4 characters")
        .max(50, "Name must be less than 50 characters"),
    email: z.string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
    password: z.string({ required_error: "Password is required" })
        .min(1, "Password is required")
        .min(8, "Password must be more than 8 characters")
        .max(32, "Password must be less than 32 characters"),
    confirmPassword: z.string({ required_error: "Confirm Password is required" })
        .min(1, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})
