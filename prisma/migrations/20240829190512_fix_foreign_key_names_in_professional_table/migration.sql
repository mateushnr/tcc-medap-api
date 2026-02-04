/*
  Warnings:

  - You are about to drop the column `EstablishmentBounded` on the `professional` table. All the data in the column will be lost.
  - You are about to drop the column `UnityBounded` on the `professional` table. All the data in the column will be lost.
  - Added the required column `establishmentBounded` to the `professional` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "professional" DROP CONSTRAINT "professional_EstablishmentBounded_fkey";

-- DropForeignKey
ALTER TABLE "professional" DROP CONSTRAINT "professional_UnityBounded_fkey";

-- AlterTable
ALTER TABLE "professional" DROP COLUMN "EstablishmentBounded",
DROP COLUMN "UnityBounded",
ADD COLUMN     "establishmentBounded" TEXT NOT NULL,
ADD COLUMN     "unityBounded" TEXT;

-- AddForeignKey
ALTER TABLE "professional" ADD CONSTRAINT "professional_establishmentBounded_fkey" FOREIGN KEY ("establishmentBounded") REFERENCES "establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional" ADD CONSTRAINT "professional_unityBounded_fkey" FOREIGN KEY ("unityBounded") REFERENCES "unity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
