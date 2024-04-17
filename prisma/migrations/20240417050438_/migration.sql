-- AddForeignKey
ALTER TABLE "FingerprintDetail" ADD CONSTRAINT "FingerprintDetail_bssid_fkey" FOREIGN KEY ("bssid") REFERENCES "Network"("bssid") ON DELETE RESTRICT ON UPDATE CASCADE;
