-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('FrontMatter', 'Chapter', 'EndMatter', 'Part');

-- CreateTable
CREATE TABLE "BookSection" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookSection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BookSection" ADD CONSTRAINT "BookSection_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookSection" ADD CONSTRAINT "BookSection_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BookSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
