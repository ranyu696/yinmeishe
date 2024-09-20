import { type Prisma, type Video } from '@prisma/client'
import { z } from 'zod'
import { uploadVideoCover } from '~/server/uploadFunctions'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const videoRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        coverUrl: z.string(),
        playUrl: z.string(),
        categoryId: z.number(),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.video.create({
        data: input,
      })
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        description: z.string().optional(),
        coverUrl: z.string().optional(),
        playUrl: z.string(),
        categoryId: z.number(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.db.video.update({
        where: { id },
        data,
      })
    }),

  uploadCover: protectedProcedure
    .input(
      z.object({
        imageData: z.string(),
        shouldSync: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      const { imageData, shouldSync } = input
      if (!imageData) {
        throw new Error('需要图像数据')
      }
      const result = await uploadVideoCover(imageData, shouldSync)
      return { coverUrl: result.coverPath }
    }),
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        perPage: z.number().default(10),
        categoryId: z.number().optional(),
        search: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, categoryId, search, isActive } = input
      const skip = (page - 1) * perPage

      const where: Prisma.VideoWhereInput = {
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(isActive !== undefined && { isActive }),
      }

      const [videos, totalCount] = await Promise.all([
        ctx.db.video.findMany({
          where,
          include: { category: true },
          skip,
          take: perPage,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.video.count({ where }),
      ])

      return {
        videos,
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
      }
    }),

  toggleActive: publicProcedure
    .input(
      z.object({
        id: z.number(),
        isActive: z.boolean(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.video.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      })
    }),
  getById: publicProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.db.video.findUnique({
      where: { id: input },
      include: { category: true },
    })
  }),
  getRelatedVideos: publicProcedure
    .input(
      z.object({
        videoId: z.number(),
        limit: z.number().default(4),
      }),
    )
    .query(async ({ ctx, input }) => {
      const video = await ctx.db.video.findUnique({
        where: { id: input.videoId },
        include: { category: true },
      })

      if (!video) throw new Error('找不到视频')

      // 使用原始 SQL 查询来实现随机排序
      const relatedVideos = await ctx.db.$queryRaw<Video[]>`
          SELECT * FROM "Video"
          WHERE "categoryId" = ${video.categoryId}
            AND "id" != ${video.id}
          ORDER BY RANDOM()
          LIMIT ${input.limit}
        `

      return relatedVideos
    }),
  getFeaturedVideos: publicProcedure
    .input(z.object({ limit: z.number().default(4) }))
    .query(async ({ ctx, input }) => {
      const featuredVideos = await ctx.db.$queryRaw<Video[]>`
          SELECT * FROM "Video"
          ORDER BY RANDOM()
          LIMIT ${input.limit}
        `

      return featuredVideos
    }),
  delete: publicProcedure.input(z.number()).mutation(({ ctx, input }) => {
    return ctx.db.video.delete({
      where: { id: input },
    })
  }),

  incrementPlays: publicProcedure
    .input(z.number())
    .mutation(({ ctx, input }) => {
      return ctx.db.video.update({
        where: { id: input },
        data: {
          totalPlays: { increment: 1 },
          dailyPlays: { increment: 1 },
          weeklyPlays: { increment: 1 },
        },
      })
    }),
  updateCategory: publicProcedure
    .input(
      z.object({
        ids: z.array(z.number()),
        categoryId: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.video.updateMany({
        where: { id: { in: input.ids } },
        data: { categoryId: input.categoryId },
      })
    }),

  deleteMany: publicProcedure
    .input(z.array(z.number()))
    .mutation(({ ctx, input }) => {
      return ctx.db.video.deleteMany({
        where: { id: { in: input } },
      })
    }),
})
