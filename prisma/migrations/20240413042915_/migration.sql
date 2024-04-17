/*
  Warnings:

  - You are about to drop the column `bssid` on the `AccessPoint` table. All the data in the column will be lost.
  - You are about to drop the column `ssid` on the `AccessPoint` table. All the data in the column will be lost.
  - You are about to drop the column `corridorId` on the `Coordinate` table. All the data in the column will be lost.
  - You are about to drop the `Corridor` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `roomId` to the `AccessPoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomType` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('Room', 'Corridor');

-- DropForeignKey
ALTER TABLE "Coordinate" DROP CONSTRAINT "Coordinate_corridorId_fkey";

-- DropForeignKey
ALTER TABLE "Corridor" DROP CONSTRAINT "Corridor_floorId_fkey";

-- DropForeignKey
ALTER TABLE "FingerprintDetail" DROP CONSTRAINT "FingerprintDetail_bssid_fkey";

-- DropIndex
DROP INDEX "AccessPoint_bssid_key";

-- AlterTable
ALTER TABLE "AccessPoint" DROP COLUMN "bssid",
DROP COLUMN "ssid",
ADD COLUMN     "roomId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Coordinate" DROP COLUMN "corridorId";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "roomType" "RoomType" NOT NULL;

-- DropTable
DROP TABLE "Corridor";

-- CreateTable
CREATE TABLE "Network" (
    "bssid" TEXT NOT NULL,
    "ssid" TEXT NOT NULL,
    "apId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Network_bssid_key" ON "Network"("bssid");

-- AddForeignKey
ALTER TABLE "AccessPoint" ADD CONSTRAINT "AccessPoint_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Network" ADD CONSTRAINT "Network_apId_fkey" FOREIGN KEY ("apId") REFERENCES "AccessPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FingerprintDetail" ADD CONSTRAINT "FingerprintDetail_bssid_fkey" FOREIGN KEY ("bssid") REFERENCES "Network"("bssid") ON DELETE RESTRICT ON UPDATE CASCADE;
