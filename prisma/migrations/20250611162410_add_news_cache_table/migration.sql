    -- CreateTable
    CREATE TABLE "NewsCache" (
        "id" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "data" JSONB NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "NewsCache_pkey" PRIMARY KEY ("id")
    );

    -- CreateIndex
    CREATE UNIQUE INDEX "NewsCache_key_key" ON "NewsCache"("key");