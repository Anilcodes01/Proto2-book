import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { bookProjectId, previewUrl } = await req.json();

    if (!bookProjectId || !previewUrl) {
      return NextResponse.json(
        {
          message: "All fields are required...!",
        },
        { status: 400 }
      );
    }

    // Check if BookDesign exists for this project
    const existingBookDesign = await prisma.bookDesign.findUnique({
      where: { bookProjectId },
    });
    
    console.log("Existing BookDesign: ", existingBookDesign);
    
    let save;
    
    if (existingBookDesign) {
      // Update existing record
      save = await prisma.bookDesign.update({
        where: {
          bookProjectId: bookProjectId,
        },
        data: {
          bookPdfUrl: previewUrl,
        },
      });
    } else {
      // Create new record if one doesn't exist
      save = await prisma.bookDesign.create({
        data: {
          bookProjectId: bookProjectId,
          bookPdfUrl: previewUrl,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Preview url saved successfully...!",
        url: save,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error saving URL:", error);
    return NextResponse.json(
      {
        message: "Error while saving url",
        error: error.message,
      },
      { status: 500 }
    );
  }
}