/*
  Warnings:

  - You are about to drop the column `createdAt` on the `order` table. All the data in the column will be lost.
  - Added the required column `status` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `createdAt`,
    ADD COLUMN `status` VARCHAR(191) NOT NULL,
    ADD COLUMN `total` DOUBLE NOT NULL;
