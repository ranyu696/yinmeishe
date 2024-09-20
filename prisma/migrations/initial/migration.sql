-- 处理已有数据
ALTER TABLE "User" ADD COLUMN "salt" TEXT;

-- 可选：为现有用户设置默认的盐值（如果适用）
UPDATE "User" SET "salt" = 'default_salt_value';

-- 确保没有 NULL 值
ALTER TABLE "User" ALTER COLUMN "salt" SET NOT NULL;
