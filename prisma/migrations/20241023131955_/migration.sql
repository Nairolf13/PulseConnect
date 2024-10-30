/*
  Warnings:

  - A unique constraint covering the columns `[follower_id,followed_id]` on the table `Follows` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Follows_follower_id_followed_id_key` ON `Follows`(`follower_id`, `followed_id`);
