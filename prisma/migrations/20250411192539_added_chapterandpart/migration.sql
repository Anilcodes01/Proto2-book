-- CreateTable
CREATE TABLE "AddChapter" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "chapterName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddPart" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddPart_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AddChapter" ADD CONSTRAINT "AddChapter_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddPart" ADD CONSTRAINT "AddPart_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
