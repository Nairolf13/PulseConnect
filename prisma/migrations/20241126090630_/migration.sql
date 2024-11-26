-- DropForeignKey
ALTER TABLE `Assets` DROP FOREIGN KEY `Assets_ibfk_1`;

-- AddForeignKey
ALTER TABLE `Assets` ADD CONSTRAINT `Assets_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE NO ACTION;
