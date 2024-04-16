/*
  Warnings:

  - You are about to drop the column `coordinateId` on the `AccessPoint` table. All the data in the column will be lost.
  - Added the required column `xCoordinate` to the `AccessPoint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yCoordinate` to the `AccessPoint` table without a default value. This is not possible if the table is not empty.
  - Made the column `roomId` on table `Coordinate` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AccessPoint" DROP CONSTRAINT "AccessPoint_coordinateId_fkey";

-- DropForeignKey
ALTER TABLE "Coordinate" DROP CONSTRAINT "Coordinate_roomId_fkey";

-- DropIndex
DROP INDEX "AccessPoint_coordinateId_key";

-- AlterTable
ALTER TABLE "AccessPoint" DROP COLUMN "coordinateId",
ADD COLUMN     "xCoordinate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "yCoordinate" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Coordinate" ALTER COLUMN "roomId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Coordinate" ADD CONSTRAINT "Coordinate_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
