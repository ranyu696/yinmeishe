import { TagPosition } from '@prisma/client'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const tagRouter = createTRPCRouter({
  // 获取所有标签
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.tag.findMany()
  }),
  // 获取顶部标签
  getTopTags: publicProcedure.query(({ ctx }) => {
    return ctx.db.tag.findMany({
      where: { position: TagPosition.TOP },
      orderBy: { order: 'asc' },
    })
  }),

  // 获取底部标签
  getBottomTags: publicProcedure.query(({ ctx }) => {
    return ctx.db.tag.findMany({
      where: { position: TagPosition.BOTTOM },
      orderBy: { order: 'asc' },
    })
  }),
  // 根据ID获取标签
  getById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.db.tag.findUnique({
      where: { id: input },
    })
  }),

  // 创建标签
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        order: z.number(),
        url: z.string().nullable().optional(),
        position: z.nativeEnum(TagPosition),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.tag.create({
        data: input,
      })
    }),

  // 更新标签
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        order: z.number(),
        url: z.string().nullable().optional(),
        position: z.nativeEnum(TagPosition),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.tag.update({
        where: { id },
        data,
      })
    }),

  // 删除标签
  delete: publicProcedure.input(z.number()).mutation(({ ctx, input }) => {
    return ctx.db.tag.delete({
      where: { id: input },
    })
  }),
})
