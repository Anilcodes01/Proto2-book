import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { bookProjectId, endMatterName } = await req.json();

    if (!bookProjectId || !endMatterName) {
      return NextResponse.json(
        {
          message: "all fields are required",
        },
        { status: 400 }
      );
    }

    const endMatter = await prisma.endMatter.create({
      data: {
        bookProjectId,
        endMatterName,
      },
    });

    return NextResponse.json(endMatter, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error while creating endMatter",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
