-- DropForeignKey
ALTER TABLE `Assets` DROP FOREIGN KEY `Assets_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Assets` DROP FOREIGN KEY `Assets_ibfk_2`;

-- DropForeignKey
ALTER TABLE `AssetsToCommande` DROP FOREIGN KEY `AssetsToCommande_ibfk_1`;

-- DropForeignKey
ALTER TABLE `AssetsToCommande` DROP FOREIGN KEY `AssetsToCommande_ibfk_2`;

-- DropForeignKey
ALTER TABLE `Commandes` DROP FOREIGN KEY `Commandes_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Follows` DROP FOREIGN KEY `Follows_followed_id_fkey`;

-- DropForeignKey
ALTER TABLE `Follows` DROP FOREIGN KEY `Follows_follower_id_fkey`;

-- AddForeignKey
ALTER TABLE `Assets` ADD CONSTRAINT `Assets_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assets` ADD CONSTRAINT `Assets_ibfk_2` FOREIGN KEY (`id_project`) REFERENCES `Projects`(`id_project`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssetsToCommande` ADD CONSTRAINT `AssetsToCommande_ibfk_1` FOREIGN KEY (`id_assets`) REFERENCES `Assets`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `AssetsToCommande` ADD CONSTRAINT `AssetsToCommande_ibfk_2` FOREIGN KEY (`id_commandes`) REFERENCES `Commandes`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Commandes` ADD CONSTRAINT `Commandes_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Follows` ADD CONSTRAINT `Follows_follower_id_fkey` FOREIGN KEY (`follower_id`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Follows` ADD CONSTRAINT `Follows_followed_id_fkey` FOREIGN KEY (`followed_id`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;
