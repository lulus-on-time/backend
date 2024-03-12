/*
  Warnings:

  - You are about to drop the column `nama` on the `Room` table. All the data in the column will be lost.
  - Added the required column `level` to the `Floor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Floor" ADD COLUMN     "level" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "nama",
ADD COLUMN     "name" TEXT NOT NULL;
