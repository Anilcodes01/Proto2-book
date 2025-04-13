import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const bookProjectId = req.nextUrl.searchParams.get("bookProjectId");

    if (!bookProjectId) {
      return NextResponse.json(
        {
          message: "Missing bookProjectId query parameter",
        },
        { status: 400 }
      );
    }

    const parts = await prisma.addPart.findMany({
      where: { bookProjectId },
      select: {
        id: true,
        partName: true,
        chapterId: true
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(parts, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error fetching parts",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
