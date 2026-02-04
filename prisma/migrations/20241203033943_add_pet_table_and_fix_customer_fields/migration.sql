/*
  Warnings:

  - You are about to drop the column `responsibleType` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `rg` on the `Customer` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PetStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "PetSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "PetSex" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "responsibleType",
DROP COLUMN "rg",
ADD COLUMN     "isTutor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otherDocument" TEXT,
ALTER COLUMN "cpf" DROP NOT NULL;

-- DropEnum
DROP TYPE "ResponsibleType";

-- CreateTable
CREATE TABLE "pet" (
    "id" TEXT NOT NULL,
    "petName" TEXT NOT NULL,
    "specie" TEXT NOT NULL,
    "breed" TEXT,
    "age" TEXT,
    "size" "PetSize" NOT NULL DEFAULT 'SMALL',
    "sex" "PetSex" NOT NULL DEFAULT 'MALE',
    "status" "PetStatus" NOT NULL DEFAULT 'ACTIVE',
    "establishmentRegistered" TEXT NOT NULL,
    "customerOwner" TEXT NOT NULL,

    CONSTRAINT "pet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pet" ADD CONSTRAINT "pet_establishmentRegistered_fkey" FOREIGN KEY ("establishmentRegistered") REFERENCES "establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pet" ADD CONSTRAINT "pet_customerOwner_fkey" FOREIGN KEY ("customerOwner") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
