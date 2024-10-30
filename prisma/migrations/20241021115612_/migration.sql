-- CreateTable
CREATE TABLE `Assets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NULL,
    `id_project` INTEGER NULL,
    `isPublic` BOOLEAN NULL DEFAULT true,
    `price` DECIMAL(10, 2) NULL,
    `url` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_project`(`id_project`),
    INDEX `id_user`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssetsToCommande` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_assets` INTEGER NULL,
    `id_commandes` INTEGER NULL,

    INDEX `id_assets`(`id_assets`),
    INDEX `id_commandes`(`id_commandes`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commandes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NULL,
    `payment_status` VARCHAR(50) NULL DEFAULT 'pending',
    `amount` DECIMAL(10, 2) NULL,
    `platform_fee` DECIMAL(5, 2) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_user`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commentaires` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NULL,
    `id_project` INTEGER NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_project`(`id_project`),
    INDEX `id_user`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Follows` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `follower_id` INTEGER NULL,
    `followed_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `followed_id`(`followed_id`),
    INDEX `follower_id`(`follower_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Likes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NULL,
    `id_project` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_project`(`id_project`),
    INDEX `id_user`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `sender_id` INTEGER NULL,
    `recipient_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `recipient_id`(`recipient_id`),
    INDEX `sender_id`(`sender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Projects` (
    `id_project` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `image_url` VARCHAR(255) NULL,
    `music_url` VARCHAR(255) NULL,
    `video_url` VARCHAR(255) NULL,
    `genre` ENUM('Pop', 'Rock', 'HipHop', 'Jazz', 'Classical', 'Reggae', 'Country', 'Electronic', 'RnB', 'Metal', 'Alternative', 'Blues', 'Indie', 'Folk', 'Latin', 'Soul', 'Funk', 'Punk', 'Disco', 'House', 'Techno', 'Dubstep', 'Ambient', 'Ska', 'Grunge', 'Gospel', 'Bluegrass', 'Swing', 'Industrial', 'PostRock', 'Emo', 'KPop', 'JPop', 'Cumbia', 'Salsa', 'BossaNova', 'Tango', 'Afrobeat', 'Zydeco', 'Trap', 'LoFi', 'Experimental', 'ArtRock', 'Shoegaze', 'NewWave', 'Britpop', 'GothicRock', 'BaroquePop', 'SynthPop', 'HardRock', 'PowerPop', 'SurfRock', 'PostPunk', 'ChristianRock', 'Celtic', 'Cajun', 'NoiseRock', 'StonerRock', 'ProgressiveRock', 'MelodicPunk', 'SkaPunk', 'MathRock', 'TripHop', 'DreamPop', 'Grime', 'NuMetal', 'SouthernRock', 'DarkWave', 'Vaporwave', 'Chiptune', 'SeaShanty', 'MusicalTheatre', 'Soundtrack', 'Instrumental') NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_project`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `userName` VARCHAR(50) NOT NULL,
    `lastName` VARCHAR(50) NULL,
    `firstName` VARCHAR(50) NULL,
    `age` INTEGER NULL,
    `mail` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NULL,
    `localisation` VARCHAR(255) NULL,
    `picture` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `genre` ENUM('Masculin', 'Feminin', 'Autre') NULL,

    UNIQUE INDEX `mail`(`mail`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsersToProjects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NULL,
    `id_project` INTEGER NULL,
    `role` ENUM('owner', 'user') NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_project`(`id_project`),
    INDEX `id_user`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Assets` ADD CONSTRAINT `Assets_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Assets` ADD CONSTRAINT `Assets_ibfk_2` FOREIGN KEY (`id_project`) REFERENCES `Projects`(`id_project`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `AssetsToCommande` ADD CONSTRAINT `AssetsToCommande_ibfk_1` FOREIGN KEY (`id_assets`) REFERENCES `Assets`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `AssetsToCommande` ADD CONSTRAINT `AssetsToCommande_ibfk_2` FOREIGN KEY (`id_commandes`) REFERENCES `Commandes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Commandes` ADD CONSTRAINT `Commandes_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Commentaires` ADD CONSTRAINT `Commentaires_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Commentaires` ADD CONSTRAINT `Commentaires_ibfk_2` FOREIGN KEY (`id_project`) REFERENCES `Projects`(`id_project`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Follows` ADD CONSTRAINT `Follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Follows` ADD CONSTRAINT `Follows_ibfk_2` FOREIGN KEY (`followed_id`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Likes` ADD CONSTRAINT `Likes_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Likes` ADD CONSTRAINT `Likes_ibfk_2` FOREIGN KEY (`id_project`) REFERENCES `Projects`(`id_project`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_ibfk_2` FOREIGN KEY (`recipient_id`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `UsersToProjects` ADD CONSTRAINT `UsersToProjects_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `Users`(`id_user`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `UsersToProjects` ADD CONSTRAINT `UsersToProjects_ibfk_2` FOREIGN KEY (`id_project`) REFERENCES `Projects`(`id_project`) ON DELETE NO ACTION ON UPDATE NO ACTION;
