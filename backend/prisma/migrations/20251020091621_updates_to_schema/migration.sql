/*
  Warnings:

  - Added the required column `description` to the `video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isPublic` to the `video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatar" TEXT;

-- AlterTable
ALTER TABLE "public"."video" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
