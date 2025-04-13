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

    const check = await prisma.bookDesign.findUnique({
        where: { bookProjectId },
      });
      console.log("Existing BookDesign: ", check);
      

    const save = await prisma.bookDesign.update({
        where: {
          bookProjectId: bookProjectId,
        },
        data: {
          bookPdfUrl: previewUrl,
        },
      });
      

    return NextResponse.json(
      {
        message: "Preview url saved successfully...!",
        url: save,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error while saving url",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
