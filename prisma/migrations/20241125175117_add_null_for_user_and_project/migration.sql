/*
  Warnings:

  - Made the column `id_user` on table `Assets` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Assets` DROP FOREIGN KEY `Assets_ibfk_1`;

-- AlterTable
ALTER TABLE `Assets` MODIFY `id_user` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Assets` ADD CONSTRAINT `Assets_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;
