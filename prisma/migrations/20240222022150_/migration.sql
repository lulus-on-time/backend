/*
  Warnings:

  - You are about to drop the column `apId` on the `FingerprintDetail` table. All the data in the column will be lost.
  - Added the required column `bssid` to the `FingerprintDetail` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FingerprintDetail" DROP CONSTRAINT "FingerprintDetail_apId_fkey";

-- AlterTable
ALTER TABLE "FingerprintDetail" DROP COLUMN "apId",
ADD COLUMN     "bssid" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "FingerprintDetail" ADD CONSTRAINT "FingerprintDetail_bssid_fkey" FOREIGN KEY ("bssid") REFERENCES "AccessPoint"("bssid") ON DELETE RESTRICT ON UPDATE CASCADE;
