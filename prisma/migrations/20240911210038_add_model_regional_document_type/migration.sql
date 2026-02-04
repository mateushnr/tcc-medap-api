/*
  Warnings:

  - The `regionalDocumentType` column on the `professional` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DocumentTypeStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- AlterTable
ALTER TABLE "professional" DROP COLUMN "regionalDocumentType",
ADD COLUMN     "regionalDocumentType" TEXT;

-- DropEnum
DROP TYPE "ProfessionalRegionalDocumentType";

-- CreateTable
CREATE TABLE "RegionalDocumentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "status" "DocumentTypeStatus" NOT NULL DEFAULT 'ACTIVE',
    "establishmentRegistered" TEXT,

    CONSTRAINT "RegionalDocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegionalDocumentType_name_key" ON "RegionalDocumentType"("name");

-- AddForeignKey
ALTER TABLE "professional" ADD CONSTRAINT "professional_regionalDocument_fkey" FOREIGN KEY ("regionalDocument") REFERENCES "RegionalDocumentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalDocumentType" ADD CONSTRAINT "RegionalDocumentType_establishmentRegistered_fkey" FOREIGN KEY ("establishmentRegistered") REFERENCES "establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
