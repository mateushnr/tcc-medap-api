/*
  Warnings:

  - The values [INDUSTRIALIZADOS] on the enum `MedicineRegulatoryCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `medicinePharmaceuticalForm` on the `medicine` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MedicineRegulatoryCategory_new" AS ENUM ('FITOTERAPICO', 'INOVADOR', 'NOVO', 'SIMILAR', 'BIOLOGICO', 'ESPECIFICO', 'GENERICO', 'DINAMIZADO', 'SINTETICO', 'RADIOFARMACO', 'INDUSTRIALIZADO');
ALTER TABLE "medicine" ALTER COLUMN "regulatoryCategory" TYPE "MedicineRegulatoryCategory_new" USING ("regulatoryCategory"::text::"MedicineRegulatoryCategory_new");
ALTER TYPE "MedicineRegulatoryCategory" RENAME TO "MedicineRegulatoryCategory_old";
ALTER TYPE "MedicineRegulatoryCategory_new" RENAME TO "MedicineRegulatoryCategory";
DROP TYPE "MedicineRegulatoryCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "medicine" DROP COLUMN "medicinePharmaceuticalForm",
ADD COLUMN     "pharmaceuticalForm" "MedicinePharmaceuticalForm" NOT NULL DEFAULT 'COMPRIMIDO';
