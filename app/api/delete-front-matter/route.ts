import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
    try {
        const { frontMatterId } = await req.json();

        if (!frontMatterId) {
            return NextResponse.json({ message: 'Missing frontMatterId in request body' }, { status: 400 });
        }

        const existingItem = await prisma.frontMatter.findUnique({
            where: { id: frontMatterId },
        });

        if (!existingItem) {
             return NextResponse.json({ message: `Front Matter item with ID ${frontMatterId} not found` }, { status: 404 });
        }

        await prisma.frontMatter.delete({
            where: {
                id: frontMatterId,
            },
        });

         return NextResponse.json({ message: 'Front Matter item deleted successfully' }, { status: 200 });

    } catch (error: any) {
        console.error("Error deleting front matter:", error);
        return NextResponse.json({
            message: 'Error deleting front matter',
            error: error.message
        }, { status: 500 });
    }
}