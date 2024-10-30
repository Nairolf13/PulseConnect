/*
  Warnings:

  - Made the column `lastName` on table `Users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstName` on table `Users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `age` on table `Users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `localisation` on table `Users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Users` MODIFY `lastName` VARCHAR(50) NOT NULL,
    MODIFY `firstName` VARCHAR(50) NOT NULL,
    MODIFY `age` INTEGER NOT NULL,
    MODIFY `localisation` VARCHAR(255) NOT NULL;
