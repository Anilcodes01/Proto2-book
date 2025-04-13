import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { partId } = await req.json();

    const deletedPart = await prisma.addPart.delete({
      where: { id: partId },
    });

    return NextResponse.json(
      {
        message: "Part deleted successfully...!",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error deleting par",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
