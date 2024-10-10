import { CategoryType } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.category.findMany({
      where: { isActive: true },
      include: {
        subCategories: true,
        parent: true,
      },
      orderBy: { order: 'asc' },
    })
  }),

  getByType: publicProcedure
    .input(z.object({ type: z.nativeEnum(CategoryType) }))
    .query(({ ctx, input }) => {
      return ctx.db.category.findMany({
        where: { type: input.type, isActive: true },
        include: {
          subCategories: true,
          parent: true,
        },
        orderBy: { order: 'asc' },
      })
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
        include: {
          subCategories: true,
          parent: true,
        },
      })

      if (!category || !category.isActive) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `没有带 id 的活动类别 '${input.id}'`,
        })
      }

      return category
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.nativeEnum(CategoryType),
        parentId: z.number().optional().nullable(),
        isActive: z.boolean().optional(),
        order: z.number().optional(),
        url: z.string().optional().nullable(), // 添加 url 字段
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.category.create({
        data: input,
      })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        type: z.nativeEnum(CategoryType),
        parentId: z.number().optional().nullable(),
        isActive: z.boolean().optional(),
        order: z.number().optional(),
        url: z.string().optional().nullable(), // 添加 url 字段
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.category.update({
        where: { id },
        data,
      })
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      // 首先，更新所有子类别以删除父引用
      await ctx.db.category.updateMany({
        where: { parentId: input },
        data: { parentId: null },
      })

      // 然后删除类别
      return ctx.db.category.delete({
        where: { id: input },
      })
    }),

  getTopLevelCategories: publicProcedure
    .input(z.object({ type: z.nativeEnum(CategoryType).optional() }))
    .query(({ ctx, input }) => {
      return ctx.db.category.findMany({
        where: {
          parentId: null,
          isActive: true,
          ...(input.type && { type: input.type }),
        },
        include: {
          subCategories: true,
        },
        orderBy: { order: 'asc' },
      })
    }),

  getSubCategories: publicProcedure
    .input(z.object({ parentId: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.category.findMany({
        where: { parentId: input.parentId, isActive: true },
        orderBy: { order: 'asc' },
      })
    }),

  toggleActive: protectedProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.category.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      })
    }),

  reorder: protectedProcedure
    .input(z.array(z.object({ id: z.number(), order: z.number() })))
    .mutation(async ({ ctx, input }) => {
      const updates = input.map(({ id, order }) =>
        ctx.db.category.update({
          where: { id },
          data: { order },
        }),
      )
      await Promise.all(updates)
      return { success: true }
    }),
})
