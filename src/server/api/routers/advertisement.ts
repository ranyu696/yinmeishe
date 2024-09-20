import { type Prisma } from '@prisma/client'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const advertisementRouter = createTRPCRouter({
  // 获取所有广告
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.advertisement.findMany()
  }),
  getBanners: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.advertisement.findMany({
      where: {
        type: 'BANNER',
      },
      orderBy: {
        order: 'asc',
      },
    })
  }),
  getIcons: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.advertisement.findMany({
      where: {
        type: 'ICON',
      },
      orderBy: {
        order: 'asc',
      },
    })
  }),

  // 根据ID获取广告
  getById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.db.advertisement.findUnique({
      where: { id: input },
    })
  }),

  // 创建广告
  // 创建广告
  create: publicProcedure
    .input(
      z.object({
        type: z.enum(['BANNER', 'ICON']), // 验证广告类型必须是 BANNER 或 ICON
        title: z.string(), // 标题是必须字段
        imagePath: z.string(), // 图片路径是必须字段
        linkUrl: z.string().optional(), // 链接 URL 是可选字段
        startDate: z.date().optional(), // 开始日期是可选字段
        endDate: z.date().optional(), // 结束日期是可选字段
        order: z.number(), // 序号是必须字段
      }),
    )
    .mutation(({ ctx, input }) => {
      // 定义 Prisma.AdvertisementCreateInput 类型的数据
      const data: Prisma.AdvertisementCreateInput = {
        type: input.type,
        title: input.title,
        imagePath: input.imagePath,
        linkUrl: input.linkUrl ?? '', // linkUrl 如果没有，设置为 undefined
        startDate: input.startDate ?? new Date(), // 如果没提供 startDate，默认为当前日期
        endDate: input.endDate ?? new Date(), // endDate 如果没有，设置为 undefined
        order: input.order,
      }

      // 创建广告记录并返回
      return ctx.db.advertisement.create({ data })
    }),

  // 更新广告
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        type: z.enum(['BANNER', 'ICON']),
        title: z.string().optional(),
        imagePath: z.string(),
        linkUrl: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        order: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.advertisement.update({
        where: { id: input.id },
        data: input,
      })
    }),

  // 删除广告
  delete: publicProcedure.input(z.number()).mutation(({ ctx, input }) => {
    return ctx.db.advertisement.delete({
      where: { id: input },
    })
  }),
})
