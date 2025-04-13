import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req:NextRequest) {

    try {
        const {chapterId} = await req.json();

        const deletedChapter = await prisma.addChapter.delete({
            where: {id: chapterId}
        })

        return NextResponse.json({
            message: 'Chapter deleted successfully...!'
        }, {status: 200})
    } catch (error: any) {
        return NextResponse.json({
            message: 'Error while deleting chapter',
            error: error.message
        }, {status: 500})
    }
    
}