import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/prisma/prisma" // Adjust this import based on your Prisma client location
import bcrypt from 'bcrypt';

async function saltAndHashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Extract data directly without schema validation
        const { name, email, password } = body

        // Basic validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            )
        }

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