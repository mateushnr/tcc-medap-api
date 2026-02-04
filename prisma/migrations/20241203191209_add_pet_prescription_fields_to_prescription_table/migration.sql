-- CreateEnum
CREATE TYPE "PrescriptionType" AS ENUM ('MEDIC', 'VETERINARY');

-- DropForeignKey
ALTER TABLE "prescription" DROP CONSTRAINT "prescription_patientPrescription_fkey";

-- AlterTable
ALTER TABLE "prescription" ADD COLUMN     "petPrescription" TEXT,
ADD COLUMN     "prescriptionType" "PrescriptionType" NOT NULL DEFAULT 'MEDIC',
ADD COLUMN     "tutorPrescription" TEXT,
ALTER COLUMN "patientPrescription" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_patientPrescription_fkey" FOREIGN KEY ("patientPrescription") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_tutorPrescription_fkey" FOREIGN KEY ("tutorPrescription") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
