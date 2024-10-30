-- DropForeignKey
ALTER TABLE `Likes` DROP FOREIGN KEY `Likes_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Likes` DROP FOREIGN KEY `Likes_ibfk_2`;

-- AlterTable
ALTER TABLE `Likes` ADD COLUMN `id_asset` INTEGER NULL;

-- CreateIndex
CREATE INDEX `idx_asset` ON `Likes`(`id_asset`);

-- AddForeignKey
ALTER TABLE `Likes` ADD CONSTRAINT `Likes_user_fk` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Likes` ADD CONSTRAINT `Likes_project_fk` FOREIGN KEY (`id_project`) REFERENCES `Projects`(`id_project`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Likes` ADD CONSTRAINT `Likes_asset_fk` FOREIGN KEY (`id_asset`) REFERENCES `Assets`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
ALTER TABLE `Likes` RENAME INDEX `id_project` TO `idx_project`;

-- RenameIndex
ALTER TABLE `Likes` RENAME INDEX `id_user` TO `idx_user`;
