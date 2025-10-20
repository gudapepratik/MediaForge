-- AlterTable
ALTER TABLE "public"."video" ADD COLUMN     "thumbnail" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "isPublic" DROP NOT NULL,
ALTER COLUMN "title" DROP NOT NULL;
