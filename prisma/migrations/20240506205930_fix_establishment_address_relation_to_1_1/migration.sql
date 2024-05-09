/*
  Warnings:

  - A unique constraint covering the columns `[establishmentAddress]` on the table `establishment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "establishment_establishmentAddress_key" ON "establishment"("establishmentAddress");
