/*
  Warnings:

  - A unique constraint covering the columns `[id_user,id_project]` on the table `UsersToProjects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `UsersToProjects_id_user_id_project_key` ON `UsersToProjects`(`id_user`, `id_project`);
