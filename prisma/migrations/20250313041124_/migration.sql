-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "email_verified" DATETIME,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_users" ("email", "email_verified", "id", "image", "name", "password", "username") SELECT "email", "email_verified", "id", "image", "name", "password", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE TABLE "new_verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "verification_tokens_identifier_fkey" FOREIGN KEY ("identifier") REFERENCES "users" ("username") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_verification_tokens" ("expires", "identifier", "token") SELECT "expires", "identifier", "token" FROM "verification_tokens";
DROP TABLE "verification_tokens";
ALTER TABLE "new_verification_tokens" RENAME TO "verification_tokens";
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
