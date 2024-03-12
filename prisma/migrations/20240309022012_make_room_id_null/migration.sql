-- DropForeignKey
ALTER TABLE "Coordinate" DROP CONSTRAINT "Coordinate_roomId_fkey";

-- AlterTable
ALTER TABLE "Coordinate" ALTER COLUMN "roomId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Coordinate" ADD CONSTRAINT "Coordinate_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
