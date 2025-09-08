/*
  Warnings:

  - You are about to drop the column `UploadID` on the `upload` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uploadId]` on the table `upload` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uploadId` to the `upload` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "public"."VIDEO_STATE" ADD VALUE 'CANCELLED';

-- DropIndex
DROP INDEX "public"."upload_UploadID_key";

-- AlterTable
ALTER TABLE "public"."upload" DROP COLUMN "UploadID",
ADD COLUMN     "uploadId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "upload_uploadId_key" ON "public"."upload"("uploadId");
