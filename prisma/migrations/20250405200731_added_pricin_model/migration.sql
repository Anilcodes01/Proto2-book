-- CreateTable
CREATE TABLE "BookPricing" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "packagePrice" DOUBLE PRECISION NOT NULL,
    "paperbackPriceInd" DOUBLE PRECISION,
    "hardcoverPriceInd" DOUBLE PRECISION,
    "paperbackPriceInternational" DOUBLE PRECISION,
    "hardcoverPriceInternational" DOUBLE PRECISION,

    CONSTRAINT "BookPricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookPricing_bookProjectId_key" ON "BookPricing"("bookProjectId");

-- AddForeignKey
ALTER TABLE "BookPricing" ADD CONSTRAINT "BookPricing_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
