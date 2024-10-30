/*
  Warnings:

  - You are about to drop the column `recipient_id` on the `Messages` table. All the data in the column will be lost.
  - You are about to drop the column `sender_id` on the `Messages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Messages` DROP FOREIGN KEY `Messages_recipient`;

-- DropForeignKey
ALTER TABLE `Messages` DROP FOREIGN KEY `Messages_sender`;

-- AlterTable
ALTER TABLE `Messages` DROP COLUMN `recipient_id`,
    DROP COLUMN `sender_id`,
    ADD COLUMN `recipientId` INTEGER NULL,
    ADD COLUMN `senderId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `recipient_id` ON `Messages`(`recipientId`);

-- CreateIndex
CREATE INDEX `sender_id` ON `Messages`(`senderId`);

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_sender` FOREIGN KEY (`senderId`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_recipient` FOREIGN KEY (`recipientId`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;
