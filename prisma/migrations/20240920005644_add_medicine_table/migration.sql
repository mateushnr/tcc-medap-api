-- CreateEnum
CREATE TYPE "MedicineStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "MedicineForUse" AS ENUM ('HUMAN', 'ANIMAL', 'BOTH');

-- CreateTable
CREATE TABLE "medicine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "forUse" "MedicineForUse" NOT NULL DEFAULT 'HUMAN',
    "consumptionMethod" TEXT,
    "idEstablishment" TEXT,
    "status" "MedicineStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "medicine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "medicine_name_key" ON "medicine"("name");
