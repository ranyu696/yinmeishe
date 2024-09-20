/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `Novel` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `externalId` to the `Novel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Novel" ADD COLUMN     "externalId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Novel_externalId_key" ON "Novel"("externalId");
