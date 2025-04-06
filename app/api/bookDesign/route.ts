import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest,) {
  try {
    const {
      bookProjectId,
      size,
      bindingType,
      bookInteriorColour,
      paperType,
      coverLamination,
      interiorDesign,
      bookPdfUrl,
    } = await req.json();
    if (
      !size ||
      !bindingType ||
      !bookInteriorColour ||
      !paperType ||
      !coverLamination ||
      !interiorDesign ||
      !bookPdfUrl
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingDesign = await prisma.bookDesign.findUnique({
      where: { bookProjectId },
    });

    let bookDesign;

    if (existingDesign) {
      bookDesign = await prisma.bookDesign.update({
        where: { bookProjectId },
        data: {
          bindingType,
          size,
          paperType,
          coverLamination,
          interiorDesign,
          bookInteriorColour,
          bookPdfUrl,
        },
      });
    } else {
      bookDesign = await prisma.bookDesign.create({
        data: {
          bookProject: { connect: { id: bookProjectId } },
          bindingType,
          size,
          paperType,
          coverLamination,
          interiorDesign,
          bookInteriorColour,
          bookPdfUrl,
        },
      });
    }

    return NextResponse.json({
      message: "Book design created successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error occurred while processing the request",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

