-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'AWAITING_APPROVAL';

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "proofPhotoUrl" TEXT;
