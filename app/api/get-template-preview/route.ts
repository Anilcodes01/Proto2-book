import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {

    try {
        const bookProjectId = req.nextUrl.searchParams.get('bookProjectId');

        if(!bookProjectId) {
            return NextResponse.json({
                message: 'no book id found'
            } , {status: 400})
        }

    const book = await prisma.bookDesign.findFirst({
        where: {bookProjectId},
        select: {
            bookPdfUrl: true
        }
    })

    return NextResponse.json({
        message: 'book pdf url fetched successfully',
        book
    } , {status: 200})
    } catch (error: any) {
        return NextResponse.json({
            message: 'Error while fetching preview',
            error: error.message
        }, {status: 500})
    }
}