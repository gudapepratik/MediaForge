-- CreateEnum
CREATE TYPE "public"."UPLOAD_STATE" AS ENUM ('INITIATED', 'UPLOADING', 'COMPLETED', 'ABORTED');

-- CreateEnum
CREATE TYPE "public"."PART_STATE" AS ENUM ('PENDING', 'INITIATED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."upload" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "UploadID" TEXT NOT NULL,
    "status" "public"."UPLOAD_STATE" NOT NULL DEFAULT 'INITIATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."uploadPart" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "partNo" INTEGER NOT NULL,
    "partSize" BIGINT NOT NULL,
    "eTag" TEXT,
    "status" "public"."PART_STATE" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uploadPart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "upload_videoId_key" ON "public"."upload"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "upload_UploadID_key" ON "public"."upload"("UploadID");

-- CreateIndex
CREATE INDEX "uploadPart_uploadId_partNo_idx" ON "public"."uploadPart"("uploadId", "partNo");

-- AddForeignKey
ALTER TABLE "public"."upload" ADD CONSTRAINT "upload_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "public"."video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."uploadPart" ADD CONSTRAINT "uploadPart_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "public"."upload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
