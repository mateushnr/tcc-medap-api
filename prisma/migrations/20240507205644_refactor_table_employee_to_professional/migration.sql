/*
  Warnings:

  - You are about to drop the `employee` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "employee" DROP CONSTRAINT "employee_employeeAddress_fkey";

-- DropForeignKey
ALTER TABLE "employee" DROP CONSTRAINT "employee_employeeEstablishment_fkey";

-- DropTable
DROP TABLE "employee";

-- CreateTable
CREATE TABLE "professional" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "birthDate" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "password" TEXT NOT NULL,
    "accessLevel" INTEGER NOT NULL,
    "bound" TEXT NOT NULL DEFAULT 'Estabelecimento',
    "professionalAddress" TEXT,
    "professionalEstablishment" TEXT NOT NULL,

    CONSTRAINT "professional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "professional_name_key" ON "professional"("name");

-- CreateIndex
CREATE UNIQUE INDEX "professional_email_key" ON "professional"("email");

-- CreateIndex
CREATE UNIQUE INDEX "professional_cpf_key" ON "professional"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "professional_professionalAddress_key" ON "professional"("professionalAddress");

-- AddForeignKey
ALTER TABLE "professional" ADD CONSTRAINT "professional_professionalAddress_fkey" FOREIGN KEY ("professionalAddress") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional" ADD CONSTRAINT "professional_professionalEstablishment_fkey" FOREIGN KEY ("professionalEstablishment") REFERENCES "establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
