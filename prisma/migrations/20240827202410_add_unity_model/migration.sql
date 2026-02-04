-- CreateEnum
CREATE TYPE "UnityStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "UnityTargetCustomer" AS ENUM ('HUMAN', 'ANIMAL', 'MIXED');

-- CreateEnum
CREATE TYPE "UnityType" AS ENUM ('INTERNAL', 'UBS', 'CEO', 'UTI', 'MOBILE_UNITY', 'AMBULATORY', 'CLINIC', 'EMERGENCY_UNITY', 'POLYCLINIC', 'UPA', 'MEDICAL_OFFICE', 'HEALTH_CENTER');

-- CreateTable
CREATE TABLE "unity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "cnpj" TEXT,
    "type" "UnityType" NOT NULL DEFAULT 'INTERNAL',
    "especiality" TEXT,
    "mainPhone" TEXT NOT NULL,
    "secondaryPhone" TEXT,
    "targetCustomer" "UnityTargetCustomer" NOT NULL DEFAULT 'HUMAN',
    "email" TEXT NOT NULL,
    "status" "UnityStatus" NOT NULL DEFAULT 'ACTIVE',
    "unityAddress" TEXT,
    "unityEstablishment" TEXT NOT NULL,

    CONSTRAINT "unity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unity_name_key" ON "unity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unity_abbreviation_key" ON "unity"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "unity_cnpj_key" ON "unity"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "unity_email_key" ON "unity"("email");

-- CreateIndex
CREATE UNIQUE INDEX "unity_unityAddress_key" ON "unity"("unityAddress");

-- AddForeignKey
ALTER TABLE "unity" ADD CONSTRAINT "unity_unityAddress_fkey" FOREIGN KEY ("unityAddress") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unity" ADD CONSTRAINT "unity_unityEstablishment_fkey" FOREIGN KEY ("unityEstablishment") REFERENCES "establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
