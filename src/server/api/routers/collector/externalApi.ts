// src/server/api/routers/externalApi.ts
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'
import { type GetResourcesOutput } from '~/types'
import { fetchExternalCategories, fetchVideoList } from '~/utils/collector'

export const externalApiRouter = createTRPCRouter({
  getResources: protectedProcedure
    .input(
      z.object({
        apiId: z.number(),
        page: z.number().min(1).default(1),
        categoryId: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }): Promise<GetResourcesOutput> => {
      const { apiId, page, categoryId } = input

      const api = await ctx.db.externalApi.findUnique({
        where: { id: apiId },
      })

      if (!api) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '未找到外部 API',
        })
      }

      try {
        const { videoList,currentPage } = await fetchVideoList(
          api.url,
          'all',
          { page, categoryId },
        )

        if (!videoList.list || !Array.isArray(videoList.list)) {
          throw new Error('响应格式无效')
        }

        return {
          resources: videoList.list.map((video) => ({
            id: video.vod_id,
            name: video.vod_name,
            category: video.type_name,
            playerType: video.vod_play_from,
            updatedAt: video.vod_time,
          })),
          total: videoList.total,
          page: currentPage,
        }
      } catch (error) {
        console.error('获取资源时出错:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '无法从外部 API 获取资源',
        })
      }
    }),

  getCategories: publicProcedure
    .input(z.object({ apiId: z.number() }))
    .query(async ({ input, ctx }) => {
      const externalApi = await ctx.db.externalApi.findUnique({
        where: { id: input.apiId },
      })

      if (!externalApi) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '未找到有效的外部 API',
        })
      }

      const externalCategories = await fetchExternalCategories(externalApi.url)

      return externalCategories.map((category) => ({
        id: category.type_id,
        name: category.type_name,
      }))
    }),
  toggleActive: protectedProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { id, isActive } = input
      try {
        const updatedApi = await ctx.db.externalApi.update({
          where: { id },
          data: { isActive },
        })
        return updatedApi
      } catch {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '未找到外部 API',
        })
      }
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.externalApi.findMany()
  }),

  getById: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const api = await ctx.db.externalApi.findUnique({
      where: { id: input },
    })
    if (!api) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'External API not found',
      })
    }
    return api
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string(), url: z.string().url() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.externalApi.create({ data: input })
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        url: z.string().url(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      try {
        return await ctx.db.externalApi.update({
          where: { id },
          data,
        })
      } catch {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '未找到外部 API',
        })
      }
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.externalApi.delete({
          where: { id: input },
        })
        return { success: true }
      } catch {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '未找到外部 API',
        })
      }
    }),
})
