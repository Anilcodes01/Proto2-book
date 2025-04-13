/*
  Warnings:

  - Added the required column `partName` to the `AddPart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AddPart" ADD COLUMN     "partName" TEXT NOT NULL;
