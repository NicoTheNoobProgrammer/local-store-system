-- CreateTable
CREATE TABLE `ConversationSession` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `userRole` VARCHAR(191) NOT NULL DEFAULT 'USER',
    `title` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConversationMessage` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `context` JSON NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ConversationMessage_sessionId_idx`(`sessionId`),
    INDEX `ConversationMessage_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ConversationSession` ADD CONSTRAINT `ConversationSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationMessage` ADD CONSTRAINT `ConversationMessage_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `ConversationSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationMessage` ADD CONSTRAINT `ConversationMessage_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
