import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { uploadImage } from '~/server/uploadFunctions'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

// 定义更具体的值类型
const settingValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.record(z.string(), z.string()),
])

const settingSchema = z.object({
  category: z.string(),
  key: z.string(),
  value: settingValueSchema,
})

export const systemSettingsRouter = createTRPCRouter({
  uploadImage: protectedProcedure
    .input(
      z.object({
        imageData: z.string(),
        fileName: z.string(),
        category: z.string(), // 例如：'logo', 'favicon', 等
      }),
    )
    .mutation(async ({ input }) => {
      const { imageData, fileName, category } = input
      const result = await uploadImage(imageData, fileName, category)
      return result
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const settings = await ctx.db.systemSettings.findMany()
      return settings.reduce<Record<string, Record<string, unknown>>>(
        (acc, setting) => {
          if (!acc[setting.category]) {
            acc[setting.category] = {}
          }
          return {
            ...acc,
            [setting.category]: {
              ...acc[setting.category],
              [setting.key]: setting.value,
            },
          }
        },
        {},
      )
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch settings',
        cause: error,
      })
    }
  }),

  getByCategory: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const settings = await ctx.db.systemSettings.findMany({
          where: { category: input },
        })
        return settings.reduce<Record<string, unknown>>((acc, setting) => {
          acc[setting.key] = setting.value
          return acc
        }, {})
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to fetch settings for category: ${input}`,
          cause: error,
        })
      }
    }),

  update: protectedProcedure
    .input(settingSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { category, key, value } = input
        return await ctx.db.systemSettings.upsert({
          where: { category_key: { category, key } },
          update: { value },
          create: { category, key, value },
        })
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update setting',
          cause: error,
        })
      }
    }),

  updateMany: protectedProcedure
    .input(z.array(settingSchema))
    .mutation(async ({ ctx, input }) => {
      try {
        const updates = input.map(({ category, key, value }) =>
          ctx.db.systemSettings.upsert({
            where: { category_key: { category, key } },
            update: { value },
            create: { category, key, value },
          }),
        )
        await ctx.db.$transaction(updates)
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update multiple settings',
          cause: error,
        })
      }
    }),

  // 新增：删除设置
  delete: protectedProcedure
    .input(z.object({ category: z.string(), key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.systemSettings.delete({
          where: { category_key: input },
        })
        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete setting',
          cause: error,
        })
      }
    }),

  // 新增：获取单个设置
  getOne: publicProcedure
    .input(z.object({ category: z.string(), key: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const setting = await ctx.db.systemSettings.findUnique({
          where: { category_key: input },
        })

        // 不再抛出错误，而是返回 null
        return setting ? setting.value : null
      } catch (error) {
        console.error('获取设置时出错:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '无法获取设置',
          cause: error,
        })
      }
    }),
})
