-- DropIndex
DROP INDEX "Tracker_userId_idx";

-- AlterTable
ALTER TABLE "Tracker" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Tracker_userId_archivedAt_idx" ON "Tracker"("userId", "archivedAt");
