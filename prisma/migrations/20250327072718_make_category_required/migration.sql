/*
  Warnings:

  - Made the column `category` on table `summarized_news` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_summarized_news" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "url" TEXT NOT NULL
);
INSERT INTO "new_summarized_news" ("category", "content", "date", "id", "sentiment", "title", "url") SELECT "category", "content", "date", "id", "sentiment", "title", "url" FROM "summarized_news";
DROP TABLE "summarized_news";
ALTER TABLE "new_summarized_news" RENAME TO "summarized_news";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
