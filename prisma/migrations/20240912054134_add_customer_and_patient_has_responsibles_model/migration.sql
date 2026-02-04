-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "ResponsibleType" AS ENUM ('RESPONSIBLE', 'TUTOR');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT,
    "cns" TEXT,
    "rg" TEXT,
    "birthDate" TEXT,
    "mainPhone" TEXT,
    "secondaryPhone" TEXT,
    "isPatient" BOOLEAN NOT NULL DEFAULT true,
    "isResponsible" BOOLEAN NOT NULL DEFAULT false,
    "responsibleType" "ResponsibleType" NOT NULL DEFAULT 'RESPONSIBLE',
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "customerAddress" TEXT,
    "customerEstablishment" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientResponsibles" (
    "patientId" TEXT NOT NULL,
    "responsibleId" TEXT NOT NULL,

    CONSTRAINT "PatientResponsibles_pkey" PRIMARY KEY ("patientId","responsibleId")
);

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_customerAddress_fkey" FOREIGN KEY ("customerAddress") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_customerEstablishment_fkey" FOREIGN KEY ("customerEstablishment") REFERENCES "establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientResponsibles" ADD CONSTRAINT "PatientResponsibles_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientResponsibles" ADD CONSTRAINT "PatientResponsibles_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
