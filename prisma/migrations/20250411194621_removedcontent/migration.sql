/*
  Warnings:

  - You are about to drop the column `content` on the `AddChapter` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `AddPart` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AddChapter" DROP COLUMN "content";

-- AlterTable
ALTER TABLE "AddPart" DROP COLUMN "content";
