/*
  Warnings:

  - You are about to drop the column `consumptionMethod` on the `medicine` table. All the data in the column will be lost.
  - You are about to drop the column `dosage` on the `medicine` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MedicinePharmaceuticalForm" AS ENUM ('COMPRIMIDO', 'CAPSULA', 'DRAGEA', 'PASTILHA', 'SUPOSITORIO', 'POMADA', 'CREME', 'GEL', 'XAROPE', 'GOTA', 'NASAL', 'OFTALMICA', 'INJETAVEL', 'SPRAY', 'AEROSSOL');

-- CreateEnum
CREATE TYPE "MedicineRegulatoryCategory" AS ENUM ('FITOTERAPICO', 'INOVADOR', 'NOVO', 'SIMILAR', 'BIOLOGICO', 'ESPECIFICO', 'GENERICO', 'DINAMIZADO', 'SINTETICO', 'RADIOFARMACO', 'INDUSTRIALIZADOS');

-- AlterTable
ALTER TABLE "medicine" DROP COLUMN "consumptionMethod",
DROP COLUMN "dosage",
ADD COLUMN     "activeIngredient" TEXT,
ADD COLUMN     "medicinePharmaceuticalForm" "MedicinePharmaceuticalForm" NOT NULL DEFAULT 'COMPRIMIDO',
ADD COLUMN     "regulatoryCategory" "MedicineRegulatoryCategory";
