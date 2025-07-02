/*
  Warnings:

  - You are about to drop the column `titel` on the `product` table. All the data in the column will be lost.
  - Added the required column `title` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `titel`,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;
