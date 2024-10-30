/*
  Warnings:

  - Made the column `genre` on table `Users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Users` MODIFY `genre` ENUM('Masculin', 'Feminin', 'Autre') NOT NULL;
