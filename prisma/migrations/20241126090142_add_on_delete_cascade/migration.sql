/*
  Warnings:

  - The values [Texte] on the enum `Assets_genre` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Assets` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Assets` DROP FOREIGN KEY `Assets_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Assets` DROP FOREIGN KEY `Assets_ibfk_2`;

-- DropForeignKey
ALTER TABLE `Commentaires` DROP FOREIGN KEY `Commentaires_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Commentaires` DROP FOREIGN KEY `Commentaires_ibfk_2`;

-- DropForeignKey
ALTER TABLE `Commentaires` DROP FOREIGN KEY `Commentaires_ibfk_3`;

-- DropForeignKey
ALTER TABLE `Likes` DROP FOREIGN KEY `Likes_asset_fk`;

-- DropForeignKey
ALTER TABLE `Likes` DROP FOREIGN KEY `Likes_project_fk`;

-- DropForeignKey
ALTER TABLE `Likes` DROP FOREIGN KEY `Likes_user_fk`;

-- DropForeignKey
ALTER TABLE `Messages` DROP FOREIGN KEY `Messages_recipient`;

-- DropForeignKey
ALTER TABLE `Messages` DROP FOREIGN KEY `Messages_sender`;

-- DropForeignKey
ALTER TABLE `UsersToProjects` DROP FOREIGN KEY `UsersToProjects_ibfk_1`;

-- DropForeignKey
ALTER TABLE `UsersToProjects` DROP FOREIGN KEY `UsersToProjects_ibfk_2`;

-- AlterTable
ALTER TABLE `Assets` MODIFY `genre` ENUM('Pop', 'Rock', 'HipHop', 'Rap', 'Jazz', 'Classical', 'Reggae', 'Country', 'Electronic', 'RnB', 'Metal', 'Alternative', 'Blues', 'Indie', 'Folk', 'Latin', 'Soul', 'Funk', 'Punk', 'Disco', 'House', 'Techno', 'Dubstep', 'Ambient', 'Ska', 'Grunge', 'Gospel', 'Bluegrass', 'Swing', 'Industrial', 'PostRock', 'Emo', 'KPop', 'JPop', 'Cumbia', 'Salsa', 'BossaNova', 'Tango', 'Afrobeat', 'Zydeco', 'Trap', 'LoFi', 'Experimental', 'ArtRock', 'Shoegaze', 'NewWave', 'Britpop', 'GothicRock', 'BaroquePop', 'SynthPop', 'HardRock', 'PowerPop', 'SurfRock', 'PostPunk', 'ChristianRock', 'Celtic', 'Cajun', 'NoiseRock', 'StonerRock', 'ProgressiveRock', 'MelodicPunk', 'SkaPunk', 'MathRock', 'TripHop', 'DreamPop', 'Grime', 'NuMetal', 'SouthernRock', 'DarkWave', 'Vaporwave', 'Chiptune', 'SeaShanty', 'MusicalTheatre', 'Soundtrack', 'Instrumental') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Assets_name_key` ON `Assets`(`name`);

-- AddForeignKey
ALTER TABLE `Assets` ADD CONSTRAINT `Assets_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Assets` ADD CONSTRAINT `Assets_ibfk_2` FOREIGN KEY (`id_project`) REFERENCES `Projects`(`id_project`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Commentaires` ADD CONSTRAINT `Commentaires_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Commentaires` ADD CONSTRAINT `Commentaires_ibfk_2` FOREIGN KEY (`id_project`) REFERENCES `Projects`(`id_project`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Commentaires` ADD CONSTRAINT `Commentaires_ibfk_3` FOREIGN KEY (`id_asset`) REFERENCES `Assets`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Likes` ADD CONSTRAINT `Likes_user_fk` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Likes` ADD CONSTRAINT `Likes_project_fk` FOREIGN KEY (`id_project`) REFERENCES `Projects`(`id_project`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Likes` ADD CONSTRAINT `Likes_asset_fk` FOREIGN KEY (`id_asset`) REFERENCES `Assets`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_sender` FOREIGN KEY (`senderId`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_recipient` FOREIGN KEY (`recipientId`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `UsersToProjects` ADD CONSTRAINT `UsersToProjects_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `UsersToProjects` ADD CONSTRAINT `UsersToProjects_ibfk_2` FOREIGN KEY (`id_project`) REFERENCES `Projects`(`id_project`) ON DELETE CASCADE ON UPDATE NO ACTION;
