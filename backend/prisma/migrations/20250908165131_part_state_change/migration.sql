/*
  Warnings:

  - The values [CANCELLED] on the enum `PART_STATE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PART_STATE_new" AS ENUM ('PENDING', 'INITIATED', 'COMPLETED', 'FAILED');
ALTER TABLE "public"."uploadPart" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."uploadPart" ALTER COLUMN "status" TYPE "public"."PART_STATE_new" USING ("status"::text::"public"."PART_STATE_new");
ALTER TYPE "public"."PART_STATE" RENAME TO "PART_STATE_old";
ALTER TYPE "public"."PART_STATE_new" RENAME TO "PART_STATE";
DROP TYPE "public"."PART_STATE_old";
ALTER TABLE "public"."uploadPart" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
