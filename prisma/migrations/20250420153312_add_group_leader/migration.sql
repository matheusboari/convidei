-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "leaderId" TEXT;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
