/*
  Warnings:

  - The values [EMERGENCY_UNIT] on the enum `EstablishmentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstablishmentType_new" AS ENUM ('UBS', 'HOSPITAL', 'CLINIC', 'EMERGENCY_UNITY', 'POLYCLINIC', 'UPA', 'MEDICAL_OFFICE', 'HEALTH_CENTER');
ALTER TABLE "establishment" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "establishment" ALTER COLUMN "type" TYPE "EstablishmentType_new" USING ("type"::text::"EstablishmentType_new");
ALTER TYPE "EstablishmentType" RENAME TO "EstablishmentType_old";
ALTER TYPE "EstablishmentType_new" RENAME TO "EstablishmentType";
DROP TYPE "EstablishmentType_old";
ALTER TABLE "establishment" ALTER COLUMN "type" SET DEFAULT 'HOSPITAL';
COMMIT;
