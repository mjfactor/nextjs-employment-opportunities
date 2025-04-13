-- CreateTable
CREATE TABLE "CareerAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'resume',
    "structuredData" JSONB,
    "markdownResult" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareerAnalysis_userId_idx" ON "CareerAnalysis"("userId");

-- AddForeignKey
ALTER TABLE "CareerAnalysis" ADD CONSTRAINT "CareerAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
