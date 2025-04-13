import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import { auth } from "@/auth";

// GET endpoint to retrieve the latest career analysis for a user
export async function GET(req: NextRequest) {
    try {
        // Get the user session
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "You must be logged in to retrieve career analysis data" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Find the latest career analysis for this user
        const latestAnalysis = await prisma.careerAnalysis.findFirst({
            where: {
                userId,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        if (!latestAnalysis) {
            return NextResponse.json(
                { message: "No career analysis found for this user" },
                { status: 404 }
            );
        }

        return NextResponse.json(latestAnalysis);
    } catch (error) {
        console.error("Error retrieving career analysis:", error);
        return NextResponse.json(
            { error: "Failed to retrieve career analysis data" },
            { status: 500 }
        );
    }
}

// POST endpoint to save career analysis data
export async function POST(req: NextRequest) {
    try {
        // Get the user session
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "You must be logged in to save career analysis data" },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const requestData = await req.json();

        const { source, structuredData, markdownResult } = requestData;

        if (!source || (!structuredData && !markdownResult)) {
            return NextResponse.json(
                { error: "Missing required data" },
                { status: 400 }
            );
        }

        // Create or update the career analysis
        const analysis = await prisma.careerAnalysis.create({
            data: {
                userId,
                source,
                structuredData,
                markdownResult,
            },
        });

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("Error saving career analysis:", error);
        return NextResponse.json(
            { error: "Failed to save career analysis data" },
            { status: 500 }
        );
    }
}