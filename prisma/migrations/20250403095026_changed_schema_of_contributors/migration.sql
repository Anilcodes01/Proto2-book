/*
  Warnings:

  - You are about to drop the column `contributors` on the `Step1` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ContributorRole" AS ENUM ('Coauthor', 'Editor', 'Illustrator');

-- AlterTable
ALTER TABLE "Step1" DROP COLUMN "contributors";

-- DropEnum
DROP TYPE "Contributors";

-- CreateTable
CREATE TABLE "Contributor" (
    "id" TEXT NOT NULL,
    "step1Id" TEXT NOT NULL,
    "role" "ContributorRole" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_step1Id_fkey" FOREIGN KEY ("step1Id") REFERENCES "Step1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
