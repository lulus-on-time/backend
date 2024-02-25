/*
  Warnings:

  - Added the required column `rssi` to the `FingerprintDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FingerprintDetail" ADD COLUMN     "rssi" DOUBLE PRECISION NOT NULL;
