import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const friendLinkRouter = createTRPCRouter({
  // 获取所有友链
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.friendLink.findMany()
  }),
  // 获取顶部友链
  getTopLinks: publicProcedure.query(({ ctx }) => {
    return ctx.db.friendLink.findMany({
      where: { position: 'TOP' },
      orderBy: { order: 'asc' },
    })
  }),

  // 获取底部友链
  getBottomLinks: publicProcedure.query(({ ctx }) => {
    return ctx.db.friendLink.findMany({
      where: { position: 'BOTTOM' },
      orderBy: { order: 'asc' },
    })
  }),
  // 根据ID获取友链
  getById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.db.friendLink.findUnique({
      where: { id: input },
    })
  }),

  // 创建友链
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        url: z.string(),
        logoUrl: z.string().nullable().optional(),
        position: z.enum(['TOP', 'BOTTOM']),
        order: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.friendLink.create({
        data: input,
      })
    }),

  // 更新友链
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        url: z.string(),
        logoUrl: z.string().nullable().optional(),
        position: z.enum(['TOP', 'BOTTOM']),
        order: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.friendLink.update({
        where: { id: input.id },
        data: input,
      })
    }),

  // 删除友链
  delete: publicProcedure.input(z.number()).mutation(({ ctx, input }) => {
    return ctx.db.friendLink.delete({
      where: { id: input },
    })
  }),
})
