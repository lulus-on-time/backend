-- CreateTable
CREATE TABLE "AccessPoint" (
    "id" SERIAL NOT NULL,
    "bssid" TEXT NOT NULL,
    "ssid" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "AccessPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fingerprint" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FingerprintDetail" (
    "id" SERIAL NOT NULL,
    "fingerprintId" INTEGER NOT NULL,
    "apId" INTEGER NOT NULL,

    CONSTRAINT "FingerprintDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessPoint_bssid_key" ON "AccessPoint"("bssid");

-- AddForeignKey
ALTER TABLE "FingerprintDetail" ADD CONSTRAINT "FingerprintDetail_fingerprintId_fkey" FOREIGN KEY ("fingerprintId") REFERENCES "Fingerprint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FingerprintDetail" ADD CONSTRAINT "FingerprintDetail_apId_fkey" FOREIGN KEY ("apId") REFERENCES "AccessPoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
