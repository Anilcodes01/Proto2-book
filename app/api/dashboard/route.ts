import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const books = await prisma.bookProject.findMany({
      select: {
        id: true,
        title: true,
        authorName: true,
        design: {
          select: {
            coverFrontImage: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Books fetched successfully",
      data: books,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error while fetching dashboard books",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
