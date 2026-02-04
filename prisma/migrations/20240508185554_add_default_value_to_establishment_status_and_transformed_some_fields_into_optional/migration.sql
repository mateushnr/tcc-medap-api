-- AlterTable
ALTER TABLE "address" ALTER COLUMN "compliment" DROP NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;

-- AlterTable
ALTER TABLE "establishment" ALTER COLUMN "secondaryPhone" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Ativo';
