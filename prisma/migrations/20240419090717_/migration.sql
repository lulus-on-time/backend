-- DropForeignKey
ALTER TABLE "Coordinate" DROP CONSTRAINT "Coordinate_roomId_fkey";

-- DropForeignKey
ALTER TABLE "FingerprintDetail" DROP CONSTRAINT "FingerprintDetail_bssid_fkey";

-- DropForeignKey
ALTER TABLE "FingerprintDetail" DROP CONSTRAINT "FingerprintDetail_fingerprintId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_floorId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_subjectId_fkey";

-- AddForeignKey
ALTER TABLE "FingerprintDetail" ADD CONSTRAINT "FingerprintDetail_fingerprintId_fkey" FOREIGN KEY ("fingerprintId") REFERENCES "Fingerprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FingerprintDetail" ADD CONSTRAINT "FingerprintDetail_bssid_fkey" FOREIGN KEY ("bssid") REFERENCES "Network"("bssid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "Floor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coordinate" ADD CONSTRAINT "Coordinate_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
