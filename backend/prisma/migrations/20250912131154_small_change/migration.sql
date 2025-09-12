/*
  Warnings:

  - You are about to drop the column `hash` on the `upload` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hash]` on the table `video` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hash` to the `video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."upload" DROP COLUMN "hash";

-- AlterTable
ALTER TABLE "public"."video" ADD COLUMN     "hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "video_hash_key" ON "public"."video"("hash");
