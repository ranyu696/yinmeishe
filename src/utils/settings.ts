import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 获取系统设置值
 * @param category 设置类别
 * @param key 设置键
 * @returns 设置值或 null
 *
 * 注意：返回值的类型由调用者指定，使用时请确保类型的正确性
 */
export async function getSystemSetting<T>(
  category: string,
  key: string,
): Promise<T | null> {
  const setting = await prisma.systemSettings.findUnique({
    where: {
      category_key: {
        category,
        key,
      },
    },
  })

  return setting?.value as T | null
}
