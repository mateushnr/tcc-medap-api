-- DropForeignKey
ALTER TABLE "employee" DROP CONSTRAINT "employee_employeeAddress_fkey";

-- DropForeignKey
ALTER TABLE "establishment" DROP CONSTRAINT "establishment_establishmentAddress_fkey";

-- AlterTable
ALTER TABLE "employee" ALTER COLUMN "employeeAddress" DROP NOT NULL;

-- AlterTable
ALTER TABLE "establishment" ALTER COLUMN "establishmentAddress" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "establishment" ADD CONSTRAINT "establishment_establishmentAddress_fkey" FOREIGN KEY ("establishmentAddress") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_employeeAddress_fkey" FOREIGN KEY ("employeeAddress") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
