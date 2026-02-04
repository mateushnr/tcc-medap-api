/*
  Warnings:

  - You are about to drop the column `type` on the `establishment` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `unity` table. All the data in the column will be lost.
  - Added the required column `establishmentType` to the `establishment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unityType` to the `unity` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AvailableForOptions" AS ENUM ('ESTABLISHMENT', 'UNITY', 'BOTH');

-- CreateEnum
CREATE TYPE "EstablishmentTypeStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- AlterTable
ALTER TABLE "establishment" DROP COLUMN "type",
ADD COLUMN     "establishmentType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "unity" DROP COLUMN "type",
ADD COLUMN     "unityType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "EstablishmentType";

-- DropEnum
DROP TYPE "UnityType";

-- CreateTable
CREATE TABLE "EstablishmentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "availableFor" "AvailableForOptions" NOT NULL DEFAULT 'UNITY',
    "status" "EstablishmentTypeStatus" NOT NULL DEFAULT 'ACTIVE',
    "establishmentRegistered" TEXT,

    CONSTRAINT "EstablishmentType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EstablishmentType_name_key" ON "EstablishmentType"("name");

-- AddForeignKey
ALTER TABLE "establishment" ADD CONSTRAINT "establishment_establishmentType_fkey" FOREIGN KEY ("establishmentType") REFERENCES "EstablishmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unity" ADD CONSTRAINT "unity_unityType_fkey" FOREIGN KEY ("unityType") REFERENCES "EstablishmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstablishmentType" ADD CONSTRAINT "EstablishmentType_establishmentRegistered_fkey" FOREIGN KEY ("establishmentRegistered") REFERENCES "establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
