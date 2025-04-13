import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { bookProjectId, chapterId, partName,  } = await req.json();

    if (!bookProjectId || !chapterId || !partName ) {
      return NextResponse.json(
        {
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    const part = await prisma.addPart.create({
      data: {
        bookProjectId,
        chapterId,
        partName,
       
      },
    });

    return NextResponse.json(part, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error adding new part",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
