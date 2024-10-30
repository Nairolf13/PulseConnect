/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `PasswordResetTokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `PasswordResetTokens` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Users` ADD COLUMN `description` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PasswordResetTokens_email_key` ON `PasswordResetTokens`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `PasswordResetTokens_token_key` ON `PasswordResetTokens`(`token`);
