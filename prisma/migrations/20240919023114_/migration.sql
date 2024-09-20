/*
  Warnings:

  - The primary key for the `SystemSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `settings` on the `SystemSettings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[category,key]` on the table `SystemSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `SystemSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `SystemSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `SystemSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SystemSettings" DROP CONSTRAINT "SystemSettings_pkey",
DROP COLUMN "settings",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "value" JSONB NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "SystemSettings_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_category_key_key" ON "SystemSettings"("category", "key");
