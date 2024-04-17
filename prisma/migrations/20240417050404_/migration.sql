-- DropIndex
DROP INDEX "Network_bssid_key" CASCADE;

-- AlterTable
ALTER TABLE "Network" ADD CONSTRAINT "Network_pkey" PRIMARY KEY ("bssid");
