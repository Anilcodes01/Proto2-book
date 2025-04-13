import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const bookProjectId = req.nextUrl.searchParams.get('bookProjectId');

        if (!bookProjectId) {
             return NextResponse.json({
                message: 'Missing bookProjectId query parameter'
            }, {status: 400}); 
        }

        const chapters = await prisma.addChapter.findMany({
            where: {
                bookProjectId: bookProjectId 
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        return NextResponse.json(chapters, {status: 200}); 

    } catch (error) {
        console.error("Error fetching chapters:", error); 
        return NextResponse.json({
            message: 'Error fetching chapters',
            error: error instanceof Error ? error.message : String(error)
        }, {status: 500});
    }
}