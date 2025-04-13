import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createSectionSchema = z.object({
  bookProjectId: z.string(),
  type: z.enum(["FrontMatter", "Chapter", "Part", "EndMatter"]),
  title: z.string().min(1),
  parentId: z.string().nullable().optional(),
  order: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createSectionSchema.parse(body);

    const book = await prisma.bookProject.findUnique({
      where: { id: data.bookProjectId },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Book project not found." },
        { status: 404 }
      );
    }

    if (data.type !== "Part" && data.parentId) {
      return NextResponse.json(
        { error: "`parentId` should only be used when creating a Part." },
        { status: 400 }
      );
    }

    const section = await prisma.bookSection.create({
      data: {
        bookProjectId: data.bookProjectId,
        type: data.type,
        title: data.title,
        parentId: data.parentId || null,
        order: data.order ?? 0,
      },
    });

    return NextResponse.json(
      { message: "Section created", section },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error creating section",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
