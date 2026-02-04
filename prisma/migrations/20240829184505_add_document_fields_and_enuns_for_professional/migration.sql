/*
  Warnings:

  - You are about to drop the column `accessLevel` on the `professional` table. All the data in the column will be lost.
  - You are about to drop the column `bound` on the `professional` table. All the data in the column will be lost.
  - You are about to drop the column `professionalEstablishment` on the `professional` table. All the data in the column will be lost.
  - Added the required column `EstablishmentBounded` to the `professional` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProfessionalBound" AS ENUM ('ESTABLISHMENT', 'UNITY');

-- CreateEnum
CREATE TYPE "ProfessionalRegionalDocumentType" AS ENUM ('CRM', 'CRMV', 'CRO', 'COREN');

-- DropForeignKey
ALTER TABLE "professional" DROP CONSTRAINT "professional_professionalEstablishment_fkey";

-- AlterTable
ALTER TABLE "professional" DROP COLUMN "accessLevel",
DROP COLUMN "bound",
DROP COLUMN "professionalEstablishment",
ADD COLUMN     "EstablishmentBounded" TEXT NOT NULL,
ADD COLUMN     "UnityBounded" TEXT,
ADD COLUMN     "boundedTo" "ProfessionalBound" NOT NULL DEFAULT 'ESTABLISHMENT',
ADD COLUMN     "especiality" TEXT,
ADD COLUMN     "regionalDocument" TEXT,
ADD COLUMN     "regionalDocumentType" "ProfessionalRegionalDocumentType" NOT NULL DEFAULT 'CRM',
ADD COLUMN     "stateDocumentIssued" TEXT,
ALTER COLUMN "birthDate" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "professional" ADD CONSTRAINT "professional_EstablishmentBounded_fkey" FOREIGN KEY ("EstablishmentBounded") REFERENCES "establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional" ADD CONSTRAINT "professional_UnityBounded_fkey" FOREIGN KEY ("UnityBounded") REFERENCES "unity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
