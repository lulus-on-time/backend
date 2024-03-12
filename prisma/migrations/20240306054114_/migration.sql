/*
  Warnings:

  - A unique constraint covering the columns `[coordinateId]` on the table `AccessPoint` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fingerprintId]` on the table `FingerprintDetail` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bssid]` on the table `FingerprintDetail` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `coordinateId` to the `AccessPoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AccessPoint" ADD COLUMN     "coordinateId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Floor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Floor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "floorId" INTEGER NOT NULL,
    "centroidId" INTEGER NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coordinate" (
    "id" SERIAL NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "Coordinate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_floorId_key" ON "Room"("floorId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_centroidId_key" ON "Room"("centroidId");

-- CreateIndex
CREATE UNIQUE INDEX "Coordinate_roomId_key" ON "Coordinate"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "AccessPoint_coordinateId_key" ON "AccessPoint"("coordinateId");

-- CreateIndex
CREATE UNIQUE INDEX "FingerprintDetail_fingerprintId_key" ON "FingerprintDetail"("fingerprintId");

-- CreateIndex
CREATE UNIQUE INDEX "FingerprintDetail_bssid_key" ON "FingerprintDetail"("bssid");

-- AddForeignKey
ALTER TABLE "AccessPoint" ADD CONSTRAINT "AccessPoint_coordinateId_fkey" FOREIGN KEY ("coordinateId") REFERENCES "Coordinate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "Floor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_centroidId_fkey" FOREIGN KEY ("centroidId") REFERENCES "Coordinate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coordinate" ADD CONSTRAINT "Coordinate_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
