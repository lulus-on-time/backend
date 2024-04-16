/*
  Warnings:

  - A unique constraint covering the columns `[level]` on the table `Floor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Floor_level_key" ON "Floor"("level");
