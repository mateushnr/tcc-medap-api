-- DropForeignKey
ALTER TABLE "professional" DROP CONSTRAINT "professional_regionalDocument_fkey";

-- AddForeignKey
ALTER TABLE "professional" ADD CONSTRAINT "professional_regionalDocumentType_fkey" FOREIGN KEY ("regionalDocumentType") REFERENCES "RegionalDocumentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
