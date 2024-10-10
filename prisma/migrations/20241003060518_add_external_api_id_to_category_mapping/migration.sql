-- 首先，添加 externalApiId 列，允许为 null
ALTER TABLE "CategoryMapping" ADD COLUMN "externalApiId" INTEGER;

-- 创建一个默认的 ExternalApi 记录（如果不存在）
INSERT INTO "ExternalApi" (name, url, "isActive", "createdAt", "updatedAt")
SELECT 'Default API', 'http://default.api', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "ExternalApi" WHERE id = 1);

-- 更新现有记录，设置默认的 externalApiId
UPDATE "CategoryMapping" SET "externalApiId" = 1 WHERE "externalApiId" IS NULL;

-- 现在将 externalApiId 列设置为 NOT NULL
ALTER TABLE "CategoryMapping" ALTER COLUMN "externalApiId" SET NOT NULL;

-- 添加外键约束
ALTER TABLE "CategoryMapping" ADD CONSTRAINT "CategoryMapping_externalApiId_fkey" FOREIGN KEY ("externalApiId") REFERENCES "ExternalApi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 添加索引
CREATE INDEX "CategoryMapping_externalApiId_idx" ON "CategoryMapping"("externalApiId");

-- 创建唯一约束
ALTER TABLE "CategoryMapping" ADD CONSTRAINT "CategoryMapping_externalId_externalApiId_key" UNIQUE ("externalId", "externalApiId");

-- 删除旧的唯一约束（如果存在）
ALTER TABLE "CategoryMapping" DROP CONSTRAINT IF EXISTS "CategoryMapping_externalId_key";