/*
  Warnings:

  - A unique constraint covering the columns `[githubUrl]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[githubId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('Personal', 'Client');

-- CreateEnum
CREATE TYPE "Privacy" AS ENUM ('Public', 'Private');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('Todo', 'InProgress', 'Done');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Active', 'Completed', 'Archived');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "color" TEXT,
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "privacy" TEXT DEFAULT 'Public',
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "type" "ProjectType" NOT NULL DEFAULT 'Personal',
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Active';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "githubId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_githubUrl_key" ON "Project"("githubUrl");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
