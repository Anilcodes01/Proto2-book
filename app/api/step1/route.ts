import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Contributor = {
  role: string;
  name: string;
};

export async function POST(req: NextRequest) {
  try {
    const { bookLanguage, bookTitle, bookSubtitle, authorName, bookGenre, contributors } = await req.json();

    if (!bookLanguage || !bookTitle || !authorName || !bookGenre) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 } 
      );
    }

    if (contributors && Array.isArray(contributors)) {
      for (const contributor of contributors) {
        if (!contributor.role || !contributor.name) {
          return NextResponse.json(
            { message: 'Each contributor must have both role and name' },
            { status: 400 }
          );
        }
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const book = await tx.step1.create({
        data: {
          bookTitle,
          bookGenre,
          bookLanguage,
          bookSubtitle,
          authorName,
        }
      });

      if (contributors && contributors.length > 0) {
        await tx.contributor.createMany({
          data: contributors.map((contributor: Contributor) => ({
            step1Id: book.id,
            role: contributor.role,
            name: contributor.name
          }))
        });
      }

      return book;
    });

    return NextResponse.json(
      { message: 'Book information saved successfully', data: result },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error saving book information:', error);
    return NextResponse.json(
      { message: 'Error while saving book information' },
      { status: 500 }
    );
  }
}