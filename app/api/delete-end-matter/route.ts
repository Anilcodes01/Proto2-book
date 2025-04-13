import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
    try {
        const { endMatterId } = await req.json();

        if (!endMatterId) {
            return NextResponse.json({ message: 'Missing endMatterId in request body' }, { status: 400 });
        }

        const existingItem = await prisma.endMatter.findUnique({
            where: { id: endMatterId },
        });

        if (!existingItem) {
             return NextResponse.json({ message: `end Matter item with ID ${endMatterId} not found` }, { status: 404 });
        }

        await prisma.endMatter.delete({
            where: {
                id: endMatterId,
            },
        });

         return NextResponse.json({ message: 'End Matter item deleted successfully' }, { status: 200 });

    } catch (error: any) {
        console.error("Error deleting end matter:", error);
        return NextResponse.json({
            message: 'Error deleting end matter',
            error: error.message
        }, { status: 500 });
    }
}