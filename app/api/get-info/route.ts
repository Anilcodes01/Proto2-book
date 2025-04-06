import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest, res: NextResponse) {
    try {
      const { bookProjectId } = await req.json();
  
      const bookDesignData = await prisma.bookDesign.findFirst({
        where: { bookProjectId },
        select: {
          coverPreview: true,
          coverLamination: true,
          size: true,
          bindingType: true,
          bookInteriorColour: true,
          paperType: true,
          interiorDesign: true,
          coverFrontImage: true,
        },
      });
  
      return NextResponse.json({
        message: "Book design data saved successfully",
        data: bookDesignData,
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          message: "Error while fetching info",
          error: error.message,
        },
        { status: 500 }
      );
    }
  }
  