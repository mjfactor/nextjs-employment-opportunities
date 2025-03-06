import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/prisma/prisma" // Adjust this import based on your Prisma client location
import { saltAndHashPassword } from "@/lib/auth/hashPassword"

// Validation schema for signup (matching frontend schema)
const signupSchema = z.object({
    name: z.string()
        .min(4, "Name must be more than 4 characters")
        .max(50, "Name must be less than 50 characters"),
    email: z.string()
        .email("Invalid email"),
    password: z.string()
        .min(8, "Password must be more than 8 characters")
        .max(32, "Password must be less than 32 characters")
})

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Validate request data
        const { name, email, password } = signupSchema.parse(body)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { message: "A user with this email already exists" },
                { status: 409 } // Conflict status code
            )
        }

        // Hash password using your existing utility function
        const hashedPassword = await saltAndHashPassword(password)

        // Create user in database
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        // Return success response (excluding password)
        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json(
            {
                user: userWithoutPassword,
                message: "Account created successfully"
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Signup error:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Invalid registration data", errors: error.format() },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: "An error occurred during registration" },
            { status: 500 }
        )
    }
}