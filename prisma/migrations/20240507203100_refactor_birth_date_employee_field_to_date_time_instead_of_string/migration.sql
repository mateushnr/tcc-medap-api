/*
  Warnings:

  - Changed the type of `birthDate` on the `employee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "employee" DROP COLUMN "birthDate",
ADD COLUMN     "birthDate" DATE NOT NULL;
