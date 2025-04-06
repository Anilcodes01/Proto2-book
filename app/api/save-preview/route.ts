import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, ) {
    try {
        const { coverPreview, coverFrontImage, bookProjectId } = await req.json();
        
        // Use upsert to either create or update the record
        const result = await prisma.bookDesign.upsert({
            where: { bookProjectId },
            update: {
                coverPreview: coverPreview,
                coverFrontImage: coverFrontImage,
            },
            create: {
                bookProjectId: bookProjectId,
                coverPreview: coverPreview,
                coverFrontImage: coverFrontImage,
            }
        });

        return NextResponse.json({
            message: "Preview saved successfully",
            data: result,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            message: "Error saving preview",
            error: error.message,
        }, { status: 500 });
    }
}