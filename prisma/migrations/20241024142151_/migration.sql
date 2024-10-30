/*
  Warnings:

  - You are about to drop the column `genre` on the `Projects` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Assets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `genre` to the `Assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Assets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Assets` ADD COLUMN `genre` ENUM('Pop', 'Rock', 'HipHop', 'Jazz', 'Classical', 'Reggae', 'Country', 'Electronic', 'RnB', 'Metal', 'Alternative', 'Blues', 'Indie', 'Folk', 'Latin', 'Soul', 'Funk', 'Punk', 'Disco', 'House', 'Techno', 'Dubstep', 'Ambient', 'Ska', 'Grunge', 'Gospel', 'Bluegrass', 'Swing', 'Industrial', 'PostRock', 'Emo', 'KPop', 'JPop', 'Cumbia', 'Salsa', 'BossaNova', 'Tango', 'Afrobeat', 'Zydeco', 'Trap', 'LoFi', 'Experimental', 'ArtRock', 'Shoegaze', 'NewWave', 'Britpop', 'GothicRock', 'BaroquePop', 'SynthPop', 'HardRock', 'PowerPop', 'SurfRock', 'PostPunk', 'ChristianRock', 'Celtic', 'Cajun', 'NoiseRock', 'StonerRock', 'ProgressiveRock', 'MelodicPunk', 'SkaPunk', 'MathRock', 'TripHop', 'DreamPop', 'Grime', 'NuMetal', 'SouthernRock', 'DarkWave', 'Vaporwave', 'Chiptune', 'SeaShanty', 'MusicalTheatre', 'Soundtrack', 'Instrumental') NOT NULL,
    ADD COLUMN `name` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Projects` DROP COLUMN `genre`;

-- CreateIndex
CREATE UNIQUE INDEX `Assets_name_key` ON `Assets`(`name`);
