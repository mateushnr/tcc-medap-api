/*
  Warnings:

  - You are about to drop the column `idEstablishment` on the `medicine` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "medicine" DROP COLUMN "idEstablishment",
ADD COLUMN     "establishmentRegistered" TEXT;

-- AddForeignKey
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_establishmentRegistered_fkey" FOREIGN KEY ("establishmentRegistered") REFERENCES "establishment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
