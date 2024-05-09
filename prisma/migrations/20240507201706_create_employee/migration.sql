-- CreateTable
CREATE TABLE "employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "password" TEXT NOT NULL,
    "accessLevel" INTEGER NOT NULL,
    "bound" TEXT NOT NULL DEFAULT 'Estabelecimento',
    "employeeAddress" TEXT NOT NULL,
    "employeeEstablishment" TEXT NOT NULL,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_name_key" ON "employee"("name");

-- CreateIndex
CREATE UNIQUE INDEX "employee_email_key" ON "employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employee_cpf_key" ON "employee"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "employee_employeeAddress_key" ON "employee"("employeeAddress");

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_employeeAddress_fkey" FOREIGN KEY ("employeeAddress") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_employeeEstablishment_fkey" FOREIGN KEY ("employeeEstablishment") REFERENCES "establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
