/*
  Warnings:

  - Made the column `follower_id` on table `Follows` required. This step will fail if there are existing NULL values in that column.
  - Made the column `followed_id` on table `Follows` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `Follows` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Follows` DROP FOREIGN KEY `Follows_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Follows` DROP FOREIGN KEY `Follows_ibfk_2`;

-- AlterTable
ALTER TABLE `Follows` MODIFY `follower_id` INTEGER NOT NULL,
    MODIFY `followed_id` INTEGER NOT NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE `Follows` ADD CONSTRAINT `Follows_follower_id_fkey` FOREIGN KEY (`follower_id`) REFERENCES `Users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Follows` ADD CONSTRAINT `Follows_followed_id_fkey` FOREIGN KEY (`followed_id`) REFERENCES `Users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;
