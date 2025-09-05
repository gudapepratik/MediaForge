-- CreateEnum
CREATE TYPE "public"."VIDEO_STATE" AS ENUM ('CREATED', 'UPLOADED', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "public"."session" (
    "sid" VARCHAR NOT NULL,
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- CreateTable
CREATE TABLE "public"."video" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storageKey" TEXT,
    "status" "public"."VIDEO_STATE" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."videoVariant" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videoVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IDX_session_expire" ON "public"."session"("expire");

-- AddForeignKey
ALTER TABLE "public"."video" ADD CONSTRAINT "video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."videoVariant" ADD CONSTRAINT "videoVariant_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "public"."video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
