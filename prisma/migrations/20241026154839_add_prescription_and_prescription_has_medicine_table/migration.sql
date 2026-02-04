-- CreateEnum
CREATE TYPE "PrescriptionHasMedicineAdministrationWay" AS ENUM ('ORAL', 'SUBLINGUAL', 'BUCAL', 'RETAL', 'VAGINAL', 'INTRAVENOSA', 'INTRAMUSCULAR', 'SUBCUTANEA', 'INTRADERMICA', 'INALATORIA', 'NASALOFTALMICA', 'OTOLOGICA', 'TOPICA', 'TRANSDERMICA', 'INTRA_ARTICULAR', 'INTRAPERITONEAL', 'EPIDURAL', 'INTRATECAL', 'INTRACARDIACA', 'URETRAL');

-- CreateTable
CREATE TABLE "prescription" (
    "id" TEXT NOT NULL,
    "emissionDate" TEXT NOT NULL,
    "expirationDate" TEXT NOT NULL,
    "Observation" TEXT,
    "establishmentPrescription" TEXT NOT NULL,
    "patientPrescription" TEXT NOT NULL,
    "professionalPrescription" TEXT NOT NULL,

    CONSTRAINT "prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionHasMedicine" (
    "prescriptionId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "totalAmount" TEXT NOT NULL,
    "administrationWay" "PrescriptionHasMedicineAdministrationWay" NOT NULL DEFAULT 'ORAL',

    CONSTRAINT "PrescriptionHasMedicine_pkey" PRIMARY KEY ("prescriptionId","medicineId")
);

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_establishmentPrescription_fkey" FOREIGN KEY ("establishmentPrescription") REFERENCES "establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_patientPrescription_fkey" FOREIGN KEY ("patientPrescription") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_professionalPrescription_fkey" FOREIGN KEY ("professionalPrescription") REFERENCES "professional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionHasMedicine" ADD CONSTRAINT "PrescriptionHasMedicine_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionHasMedicine" ADD CONSTRAINT "PrescriptionHasMedicine_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
