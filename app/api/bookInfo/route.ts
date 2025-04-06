import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Contributor = {
  role: string;
  name: string;
};

export async function POST(req: NextRequest) {
  try {
    const { title, language, subtitle, authorName, genre, contributors } = await req.json();

    if (!language || !title || !authorName || !genre) {
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

   // Replace the transaction with direct operations
const book = await prisma.bookProject.create({
  data: {
    title,
    genre,
    language,
    subtitle,
    authorName,
  }
});

if (contributors && contributors.length > 0) {
  await prisma.contributor.createMany({
    data: contributors.map((contributor: Contributor) => ({
      bookProjectId: book.id,
      role: contributor.role,
      name: contributor.name
    }))
  });
}

return NextResponse.json(
  { message: 'Book information saved successfully', data: book.id },
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