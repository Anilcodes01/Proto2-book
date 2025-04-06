/*
  Warnings:

  - You are about to drop the column `step1Id` on the `Contributor` table. All the data in the column will be lost.
  - You are about to drop the `Step1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `books` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contributor" DROP CONSTRAINT "Contributor_step1Id_fkey";

-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_bookId_fkey";

-- AlterTable
ALTER TABLE "Contributor" DROP COLUMN "step1Id",
ADD COLUMN     "bookProjectId" TEXT;

-- DropTable
DROP TABLE "Step1";

-- DropTable
DROP TABLE "books";

-- CreateTable
CREATE TABLE "BookProject" (
    "id" TEXT NOT NULL,
    "language" "BookLanguage" NOT NULL DEFAULT 'English',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "authorName" TEXT NOT NULL,
    "genre" "BookGenre" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookDesign" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "size" TEXT,
    "bindingType" TEXT,
    "bookInteriorColour" TEXT,
    "paperType" TEXT,
    "coverLamination" TEXT,
    "interiorDesign" TEXT,
    "coverDesign" TEXT,
    "bookPdfUrl" TEXT,

    CONSTRAINT "BookDesign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookDesign_bookProjectId_key" ON "BookDesign"("bookProjectId");

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookDesign" ADD CONSTRAINT "BookDesign_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
