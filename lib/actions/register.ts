"use server";

import { z } from "zod";
import { prisma } from "@/prisma/prisma";
import bcrypt from 'bcrypt';

// Schema for validation
const SignupSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6)
});

async function saltAndHashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

export async function signUp(formData: FormData | { name: string; email: string; password: string }) {
    try {
        // Handle both FormData and direct object inputs
        const rawInput = formData instanceof FormData
            ? {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                password: formData.get('password') as string
            }
            : formData;

        // Validate input
        const validatedData = SignupSchema.safeParse(rawInput);

        if (!validatedData.success) {
            return {
                error: "Invalid registration data",
                success: false,
                validationErrors: validatedData.error.format()
            };
        }

        const { name, email, password } = validatedData.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return {
                error: "A user with this email already exists",
                success: false
            };
        }

        // Hash password
        const hashedPassword = await saltAndHashPassword(password);

        // Create user in database
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        // Return success response (excluding password)
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            message: "Account created successfully",
            success: true
        };
    } catch (error) {
        console.error("Signup error:", error);
        return {
            error: "An error occurred during registration",
            success: false
        };
    }
}