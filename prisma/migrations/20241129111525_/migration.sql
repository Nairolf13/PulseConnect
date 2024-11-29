-- DropForeignKey
ALTER TABLE `UsersToProjects` DROP FOREIGN KEY `UsersToProjects_ibfk_1`;

-- AddForeignKey
ALTER TABLE `UsersToProjects` ADD CONSTRAINT `UsersToProjects_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE SET NULL ON UPDATE NO ACTION;
