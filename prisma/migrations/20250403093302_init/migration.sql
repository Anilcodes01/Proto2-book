-- CreateEnum
CREATE TYPE "BookGenre" AS ENUM ('Fiction', 'NonFiction', 'Academic', 'Poetry', 'Cookbook', 'Childrenbook', 'Others');

-- CreateEnum
CREATE TYPE "Contributors" AS ENUM ('Coauthor', 'Editor', 'Illustrator');

-- CreateEnum
CREATE TYPE "BookLanguage" AS ENUM ('English', 'Hindi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu');

-- CreateTable
CREATE TABLE "Step1" (
    "id" TEXT NOT NULL,
    "bookLanguage" "BookLanguage" NOT NULL DEFAULT 'English',
    "bookTitle" TEXT NOT NULL,
    "bookSubtitle" TEXT,
    "authorName" TEXT NOT NULL,
    "contributors" "Contributors" NOT NULL,
    "bookGenre" "BookGenre" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Step1_pkey" PRIMARY KEY ("id")
);
