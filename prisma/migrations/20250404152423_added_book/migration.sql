-- CreateTable
CREATE TABLE "books" (
    "id" SERIAL NOT NULL,
    "bookId" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "cloudinaryOriginalUrl" TEXT,
    "cloudinaryOriginalSecureUrl" TEXT,
    "cloudinaryPdfUrl" TEXT,
    "cloudinaryPdfSecureUrl" TEXT,
    "processedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorMessage" TEXT,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Step1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
