/*
  Warnings:

  - Added the required column `hash` to the `upload` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."upload" ADD COLUMN     "hash" TEXT NOT NULL;
