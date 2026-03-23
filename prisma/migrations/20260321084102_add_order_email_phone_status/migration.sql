/*
  Warnings:

  - You are about to alter the column `status` on the `order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `email` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `phone` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED') NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
