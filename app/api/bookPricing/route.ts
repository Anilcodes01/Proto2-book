import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: NextRequest, ) {
  try {
    const {
      bookProjectId,
      packageId,
      packagePrice,
      paperbackPriceInd,
      hardcoverPriceInd,
      paperbackPriceInternational,
      hardcoverPriceInternational,
    } = await req.json();

    if (
      !packageId ||
      !paperbackPriceInd ||
      !hardcoverPriceInd ||
      !paperbackPriceInternational ||
      !hardcoverPriceInternational
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingPricing = await prisma.bookPricing.findUnique({
      where: { bookProjectId },
    });
    let bookPricing;
    if (existingPricing) {
      bookPricing = await prisma.bookPricing.update({
        where: { bookProjectId },
        data: {
          packageId,
          packagePrice,
          paperbackPriceInd,
          hardcoverPriceInd,
          paperbackPriceInternational,
          hardcoverPriceInternational,
        },
      });
    } else {
      bookPricing = await prisma.bookPricing.create({
        data: {
          bookProject: { connect: { id: bookProjectId } },
          packageId,
          packagePrice,
          paperbackPriceInd,
          hardcoverPriceInd,
          paperbackPriceInternational,
          hardcoverPriceInternational,
        },
      });
    }

    return NextResponse.json({
        message: "Book pricing information saved successfully",
        data: bookPricing,
    })
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
