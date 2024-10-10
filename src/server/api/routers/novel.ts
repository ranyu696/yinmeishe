// src/server/api/routers/novel.ts
import { type Prisma } from '@prisma/client'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const novelRouter = createTRPCRouter({
  // 小说相关操作
  getAll: publicProcedure
    .input(
      z.object({
        page: z.number().default(1),
        search: z.string().optional(),
        perPage: z.number().default(10),
        categoryId: z.number().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, search, perPage, categoryId, isActive } = input
      const skip = (page - 1) * perPage

      const where: Prisma.NovelWhereInput = {
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { author: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      }

      const [novels, totalCount] = await Promise.all([
        ctx.db.novel.findMany({
          where,
          include: {
            category: true,
            chapters: {
              select: {
                id: true,
              },
            },
          },
          skip,
          take: perPage,
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.novel.count({ where }),
      ])

      const novelsWithChapterCount = novels.map((novel) => ({
        ...novel,
        chapterCount: novel.chapters.length,
        chapters: undefined, // 移除chapters数组,只保留计数
      }))

      const totalPages = Math.ceil(totalCount / perPage)

      return {
        novels: novelsWithChapterCount,
        totalPages,
        totalCount,
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.novel.findUnique({
        where: { id: input.id },
        include: {
          category: true,
          chapters: true,
        },
      })
    }),
  getRelatedNovels: publicProcedure
    .input(
      z.object({
        novelId: z.number(),
        limit: z.number().default(4),
      }),
    )
    .query(async ({ ctx, input }) => {
      const novel = await ctx.db.novel.findUnique({
        where: { id: input.novelId },
        select: { categoryId: true },
      })

      if (!novel) throw new Error('小说没找到')

      return ctx.db.novel.findMany({
        where: {
          categoryId: novel.categoryId,
          id: { not: input.novelId },
          isActive: true,
        },
        take: input.limit,
        orderBy: { views: 'desc' },
        select: {
          id: true,
          externalId: true,
          categoryId: true,
          title: true,
          author: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          views: true,
          isActive: true,
          coverUrl: true,
        },
      })
    }),
  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        author: z.string(),
        description: z.string(),
        coverUrl: z.string().nullable(),
        categoryId: z.number(),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.novel.create({
        data: {
          title: input.title,
          author: input.author,
          description: input.description,
          coverUrl: input.coverUrl,
          categoryId: input.categoryId,
          isActive: input.isActive,
        },
      })
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        author: z.string(),
        description: z.string(),
        coverUrl: z.string().nullable(),
        categoryId: z.number(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.novel.update({
        where: { id: input.id },
        data: {
          title: input.title,
          author: input.author,
          description: input.description,
          coverUrl: input.coverUrl,
          categoryId: input.categoryId,
          isActive: input.isActive,
        },
      })
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.novel.delete({
        where: { id: input.id },
      })
    }),

  updateCategory: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.number()),
        categoryId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { ids, categoryId } = input
      await ctx.db.novel.updateMany({
        where: { id: { in: ids } },
        data: { categoryId },
      })
    }),
  deleteMany: protectedProcedure
    .input(z.array(z.number()))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.novel.deleteMany({
        where: { id: { in: input } },
      })
    }),
  toggleActive: publicProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.novel.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      })
    }),

  incrementviews: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.novel.update({
        where: { id: input.id },
        data: {
          views: {
            increment: 1,
          },
        },
      })
    }),

  // 章节相关操作
  getChapters: publicProcedure
    .input(
      z.object({
        novelId: z.number(),
        page: z.number().default(1),
        perPage: z.number().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { novelId, page, perPage } = input
      const skip = (page - 1) * perPage

      const [chapters, totalCount] = await Promise.all([
        ctx.db.novelChapter.findMany({
          where: { novelId },
          orderBy: { chapterNumber: 'asc' },
          skip,
          take: perPage,
        }),
        ctx.db.novelChapter.count({ where: { novelId } }),
      ])

      const totalPages = Math.ceil(totalCount / perPage)

      return {
        chapters,
        totalCount,
        totalPages,
      }
    }),

  getChapterById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.novelChapter.findUnique({
        where: { id: input.id },
      })
    }),

  createChapter: publicProcedure
    .input(
      z.object({
        novelId: z.number(),
        title: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const chapterCount = await ctx.db.novelChapter.count({
        where: { novelId: input.novelId },
      })

      return ctx.db.novelChapter.create({
        data: {
          ...input,
          chapterNumber: chapterCount + 1,
        },
      })
    }),

  updateChapter: publicProcedure
    .input(
      z.object({
        novelId: z.number(),
        chapterNumber: z.number(),
        title: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedChapter = await ctx.db.novelChapter.updateMany({
        where: {
          novelId: input.novelId,
          chapterNumber: input.chapterNumber,
        },
        data: {
          title: input.title,
          content: input.content,
        },
      })

      return updatedChapter
    }),

  deleteChapter: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.novelChapter.delete({
        where: { id: input.id },
      })
    }),
  // 实现获取指定章节的逻辑
  getChapterByNumber: publicProcedure
    .input(z.object({ novelId: z.number(), chapterNumber: z.number() }))
    .query(async ({ ctx, input }) => {
      const chapter = await ctx.db.novelChapter.findFirst({
        where: {
          novelId: input.novelId,
          chapterNumber: input.chapterNumber,
        },
      })

      return chapter // 可能为 null
    }),

  getNextChapter: publicProcedure
    .input(z.object({ novelId: z.number(), currentChapterNumber: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.novelChapter.findFirst({
        where: {
          novelId: input.novelId,
          chapterNumber: { gt: input.currentChapterNumber },
        },
        orderBy: { chapterNumber: 'asc' },
      })
    }),

  getPreviousChapter: publicProcedure
    .input(z.object({ novelId: z.number(), currentChapterNumber: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.novelChapter.findFirst({
        where: {
          novelId: input.novelId,
          chapterNumber: { lt: input.currentChapterNumber },
        },
        orderBy: { chapterNumber: 'desc' },
      })
    }),
})
