-- CreateTable
CREATE TABLE "address" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postCode" TEXT NOT NULL,
    "compliment" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "establishment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "especiality" TEXT NOT NULL,
    "mainPhone" TEXT NOT NULL,
    "secondaryPhone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "establishmentAddress" TEXT NOT NULL,

    CONSTRAINT "establishment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "establishment_email_key" ON "establishment"("email");

-- AddForeignKey
ALTER TABLE "establishment" ADD CONSTRAINT "establishment_establishmentAddress_fkey" FOREIGN KEY ("establishmentAddress") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
