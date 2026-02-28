/*
  Warnings:

  - A unique constraint covering the columns `[userId,periodId]` on the table `Income` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Income_userId_periodId_key" ON "Income"("userId", "periodId");
