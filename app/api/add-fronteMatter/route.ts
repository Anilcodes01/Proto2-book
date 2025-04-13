import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const {bookProjectId, fronteMatterName} = await req.json();

        if(!bookProjectId || !fronteMatterName) {
            return NextResponse.json({
                message:'all fields are required'
            } , {status: 400})
        }

        const frontMatter = await prisma.frontMatter.create({
            data: {
                bookProjectId,
                fronteMatterName
            }
        })

        return NextResponse.json(frontMatter, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({
            message: 'Error while creating frontMatter',
            error: error.message
        }, {status: 500})
    }
}