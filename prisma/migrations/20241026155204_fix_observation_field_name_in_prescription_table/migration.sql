/*
  Warnings:

  - You are about to drop the column `Observation` on the `prescription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "prescription" DROP COLUMN "Observation",
ADD COLUMN     "observation" TEXT;
