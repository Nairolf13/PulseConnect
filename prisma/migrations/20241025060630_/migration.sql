-- DropForeignKey
ALTER TABLE `Messages` DROP FOREIGN KEY `Messages_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Messages` DROP FOREIGN KEY `Messages_ibfk_2`;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;
