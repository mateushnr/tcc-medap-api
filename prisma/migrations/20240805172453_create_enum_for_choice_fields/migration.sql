/*
  Warnings:

  - The `type` column on the `establishment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `establishment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `professional` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `professional` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `accessLevel` column on the `professional` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EstablishmentStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "EstablishmentType" AS ENUM ('BASIC_HEALTH_UNITY', 'MEDIC', 'VETERINARY');

-- CreateEnum
CREATE TYPE "ProfessionalStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "ProfessionalRole" AS ENUM ('HEALTH_PROFESSIONAL', 'MANAGER', 'RESPONSIBLE', 'ADMINISTRATOR');

-- AlterTable
ALTER TABLE "establishment" DROP COLUMN "type",
ADD COLUMN     "type" "EstablishmentType" NOT NULL DEFAULT 'MEDIC',
DROP COLUMN "status",
ADD COLUMN     "status" "EstablishmentStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "professional" DROP COLUMN "role",
ADD COLUMN     "role" "ProfessionalRole" NOT NULL DEFAULT 'HEALTH_PROFESSIONAL',
DROP COLUMN "status",
ADD COLUMN     "status" "ProfessionalStatus" NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "accessLevel",
ADD COLUMN     "accessLevel" "ProfessionalRole" NOT NULL DEFAULT 'HEALTH_PROFESSIONAL';
