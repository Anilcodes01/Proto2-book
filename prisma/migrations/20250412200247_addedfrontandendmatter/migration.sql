-- CreateTable
CREATE TABLE "FrontMatter" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "fronteMatterName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrontMatter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EndMatter" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "endMatterName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EndMatter_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FrontMatter" ADD CONSTRAINT "FrontMatter_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EndMatter" ADD CONSTRAINT "EndMatter_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
