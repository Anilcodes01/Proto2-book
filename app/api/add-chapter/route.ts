
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"; 

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookProjectId, chapterName } = body;

    if (!bookProjectId || !chapterName) {
      return NextResponse.json(
        { message: "Missing bookProjectId or chapterName" },
        { status: 400 }
      );
    }

    const existingChapter = await prisma.addChapter.findFirst({
        where: {
            bookProjectId: bookProjectId,
            chapterName: chapterName,
        }
    });
    if (existingChapter) {
        return NextResponse.json(
            { message: `Chapter "${chapterName}" already exists for this book.` },
            { status: 409 }
        );
    }


    const newChapter = await prisma.addChapter.create({
      data: {
        bookProjectId: bookProjectId,
        chapterName: chapterName,
      },
    });

    return NextResponse.json(newChapter, { status: 200 });

  } catch (error) {
    console.error("Error adding chapter:", error);
    return NextResponse.json(
      { message: "Error adding chapter" },
      { status: 500 }
    );
  }
}