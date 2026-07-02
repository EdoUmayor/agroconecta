-- CreateEnum
CREATE TYPE "CropStatus" AS ENUM ('PLANTED', 'GROWING', 'READY_TO_HARVEST', 'HARVESTED');

-- CreateTable
CREATE TABLE "farmers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "size_ha" DOUBLE PRECISION NOT NULL,
    "farmer_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crops" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "farm_id" INTEGER NOT NULL,
    "planted_date" TIMESTAMP(3) NOT NULL,
    "expected_harvest_date" TIMESTAMP(3) NOT NULL,
    "status" "CropStatus" NOT NULL DEFAULT 'PLANTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "harvest_records" (
    "id" SERIAL NOT NULL,
    "crop_id" INTEGER NOT NULL,
    "harvest_date" TIMESTAMP(3) NOT NULL,
    "quantity_kg" DOUBLE PRECISION NOT NULL,
    "quality_grade" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "harvest_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "farmers_email_key" ON "farmers"("email");

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crops" ADD CONSTRAINT "crops_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvest_records" ADD CONSTRAINT "harvest_records_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
