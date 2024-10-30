-- AlterTable
ALTER TABLE `Commentaires` ADD COLUMN `id_asset` INTEGER NULL;

-- CreateIndex
CREATE INDEX `id_asset` ON `Commentaires`(`id_asset`);

-- AddForeignKey
ALTER TABLE `Commentaires` ADD CONSTRAINT `Commentaires_ibfk_3` FOREIGN KEY (`id_asset`) REFERENCES `Assets`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
