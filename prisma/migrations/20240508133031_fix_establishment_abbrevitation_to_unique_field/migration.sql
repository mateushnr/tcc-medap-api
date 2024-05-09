/*
  Warnings:

  - A unique constraint covering the columns `[abbreviation]` on the table `establishment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "establishment_abbreviation_key" ON "establishment"("abbreviation");
