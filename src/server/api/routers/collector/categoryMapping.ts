import type { Category } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const categoryMappingRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.categoryMapping.findMany({
      include: { category: true, externalApi: true },
    })
  }),

  getByExternalId: protectedProcedure
    .input(z.object({ externalId: z.number(), externalApiId: z.number() }))
    .query(async ({ ctx, input }) => {
      const mapping = await ctx.db.categoryMapping.findUnique({
        where: {
          externalId_externalApiId: {
            externalId: input.externalId,
            externalApiId: input.externalApiId,
          },
        },
        include: { category: true },
      })

      if (!mapping) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `找不到外部 ID 的映射: ${input.externalId}`,
        })
      }

      return mapping
    }),

  getByApiId: protectedProcedure
    .input(z.object({ apiId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const mappings = await ctx.db.categoryMapping.findMany({
          where: { externalApiId: input.apiId },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            externalId: 'asc',
          },
        })

        if (mappings.length === 0) {
          console.log(`找不到 API ID 的类别映射: ${input.apiId}`)
        }

        return mappings.map((mapping) => ({
          externalId: mapping.externalId,
          internalId: mapping.internalId,
          categoryName:
            (mapping.category as Category | null)?.name ?? 'Unknown',
        }))
      } catch (error) {
        console.error(`获取 API ID 的类别映射时出错 ${input.apiId}:`, error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '获取类别映射时发生错误。',
        })
      }
    }),
  create: protectedProcedure
    .input(
      z.object({
        externalId: z.number(),
        internalId: z.number(),
        externalApiId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.db.categoryMapping.upsert({
          where: {
            externalId_externalApiId: {
              externalId: input.externalId,
              externalApiId: input.externalApiId,
            },
          },
          update: {
            internalId: input.internalId,
          },
          create: input,
          include: { category: true },
        })
        return result
      } catch (error) {
        console.error('创建或更新类别映射时出错:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '创建或更新类别映射时发生错误。',
        })
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        externalId: z.number(),
        internalId: z.number(),
        externalApiId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      try {
        return await ctx.db.categoryMapping.update({
          where: { id },
          data,
          include: { category: true },
        })
      } catch (error) {
        console.error('更新类别映射时出错:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '更新类别映射时发生错误。',
        })
      }
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.categoryMapping.delete({
          where: { id: input },
        })
        return { success: true }
      } catch (error) {
        console.error('未找到类别映射:', error)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '未找到类别映射。',
        })
      }
    }),
})
