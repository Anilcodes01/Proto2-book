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

        const frontMatter = await prisma.frontMatter.findMany({
            where: {
                bookProjectId: bookProjectId 
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        return NextResponse.json(frontMatter, {status: 200}); 
    } catch (error: any) {
        return NextResponse.json({
            message: 'Error while fetching frontMatter',
            error: error.message
        }, {status: 500})
    }
}