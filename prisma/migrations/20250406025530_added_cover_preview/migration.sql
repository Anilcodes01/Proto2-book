/*
  Warnings:

  - You are about to drop the column `coverDesign` on the `BookDesign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BookDesign" DROP COLUMN "coverDesign",
ADD COLUMN     "coverFrontImage" TEXT,
ADD COLUMN     "coverPreview" TEXT;
