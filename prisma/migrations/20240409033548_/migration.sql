/*
  Warnings:

  - You are about to drop the column `centroidId` on the `Room` table. All the data in the column will be lost.
  - Added the required column `poiX` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poiY` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_centroidId_fkey";

-- DropIndex
DROP INDEX "Room_centroidId_key";

-- AlterTable
ALTER TABLE "Coordinate" ADD COLUMN     "corridorId" INTEGER;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "centroidId",
ADD COLUMN     "poiX" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "poiY" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "Corridor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "floorId" INTEGER NOT NULL,
    "poiX" DOUBLE PRECISION NOT NULL,
    "poiY" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Corridor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Corridor" ADD CONSTRAINT "Corridor_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "Floor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coordinate" ADD CONSTRAINT "Coordinate_corridorId_fkey" FOREIGN KEY ("corridorId") REFERENCES "Corridor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
