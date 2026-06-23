-- AlterTable
ALTER TABLE "User" ADD COLUMN     "provider" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
