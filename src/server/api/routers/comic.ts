import { type Prisma } from '@prisma/client'
import fs from 'fs-extra'
import path from 'path'
import { z } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'
import { db } from '~/server/db'
import { uploadChapterImage, uploadComicCover } from '~/server/uploadFunctions'

export const comicRouter = createTRPCRouter({
  // Comic CRUD operations

  getAll: publicProcedure
    .input(
      z.object({
        isActive: z.boolean().optional(),
        page: z.number().default(1),
        search: z.string().optional(),
        perPage: z.number().default(10),
        categoryId: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { isActive, page, search, perPage, categoryId } = input
      const skip = (page - 1) * perPage

      const where: Prisma.ComicWhereInput = {
        isActive: (isActive ?? undefined) ? isActive : undefined,
        categoryId: categoryId ?? undefined,
      }

      if (search) {
        where.OR = [
          {
            title: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            author: {
              contains: search,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
        ]
      }

      const [comics, total] = await Promise.all([
        db.comic.findMany({
          where,
          skip,
          take: perPage,
          include: {
            category: true,
            chapters: {
              select: {
                id: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        db.comic.count({ where }),
      ])

      return {
        comics,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      }
    }),

  getById: publicProcedure.input(z.number()).query(async ({ input: id }) => {
    return db.comic.findUnique({
      where: { id },
      include: {
        category: true,
        chapters: {
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { chapterNumber: 'asc' },
        },
      },
    })
  }),
  createComic: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        author: z.string().optional(),
        description: z.string().optional(),
        categoryId: z.number(),
        coverImagePath: z.string().nullable().optional(),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      return db.comic.create({
        data: {
          ...input,
          isActive: input.isActive ?? true, // 确保有默认值
        },
      })
    }),

  updateComic: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        author: z.string().optional(),
        description: z.string().optional(),
        categoryId: z.number().optional(),
        coverImagePath: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input

      // 确保至少有一个字段被更新
      if (Object.keys(data).length === 0) {
        throw new Error('至少需要更新一个字段')
      }

      return db.comic.update({
        where: { id },
        data,
      })
    }),
  deleteComic: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return db.comic.delete({ where: { id } })
    }),

  // 上传漫画封面
  uploadCover: protectedProcedure
    .input(
      z.object({
        comicId: z.number(),
        imageSource: z.string(),
        shouldSync: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { comicId, imageSource, shouldSync } = input
      const result = await uploadComicCover(comicId, imageSource, shouldSync)
      return { success: true, ...result }
    }),

  uploadChapterImage: protectedProcedure
    .input(
      z.object({
        comicId: z.number(),
        chapterNumber: z.number(),
        imageSource: z.string(),
        order: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { comicId, chapterNumber, imageSource, order } = input
      const result = await uploadChapterImage(
        comicId,
        chapterNumber,
        imageSource,
        order,
      )
      return { success: true, ...result }
    }),

  // ComicChapter CRUD 操作
  createChapter: protectedProcedure
    .input(
      z.object({
        comicId: z.number(),
        chapterNumber: z.number(),
        title: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return db.comicChapter.create({ data: input })
    }),

  getChapter: protectedProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      return db.comicChapter.findUnique({
        where: { id },
        include: { images: { orderBy: { order: 'asc' } } },
      })
    }),

  updateChapter: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        chapterNumber: z.number().optional(),
        title: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      return db.comicChapter.update({
        where: { id },
        data,
      })
    }),

  deleteChapter: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: chapterId }) => {
      return db.$transaction(async (tx) => {
        // 获取章节信息
        const chapter = await tx.comicChapter.findUnique({
          where: { id: chapterId },
          include: { comic: true, images: true },
        })

        if (!chapter) {
          throw new Error('Chapter not found')
        }

        // 删除图片文件
        for (const image of chapter.images) {
          const filePath = path.join(process.cwd(), 'public', image.path)
          await fs.remove(filePath).catch(console.error)
        }

        // 删除图片记录
        await tx.comicImage.deleteMany({
          where: { chapterId },
        })

        // 删除章节
        await tx.comicChapter.delete({
          where: { id: chapterId },
        })

        // 删除章节目录
        const chapterDir = path.join(
          process.cwd(),
          'public',
          'uploads',
          'comics',
          chapter.comic.id.toString(),
          'chapters',
          chapter.chapterNumber.toString(),
        )
        await fs.remove(chapterDir).catch(console.error)

        return { success: true }
      })
    }),

  // 新增：获取特定章节详情
  getByNumber: publicProcedure
    .input(
      z.object({
        comicId: z.number(),
        chapterNumber: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const { comicId, chapterNumber } = input
      return db.comicChapter.findFirst({
        where: { comicId, chapterNumber },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          comic: {
            select: {
              title: true,
              author: true,
            },
          },
        },
      })
    }),
  // 新增：获取相关漫画推荐
  getRelatedComics: publicProcedure
    .input(
      z.object({
        comicId: z.number(),
        limit: z.number().default(5),
      }),
    )
    .query(async ({ input }) => {
      const { comicId, limit } = input
      const comic = await db.comic.findUnique({
        where: { id: comicId },
        select: { categoryId: true },
      })

      if (!comic) throw new Error('Comic not found')

      return db.comic.findMany({
        where: {
          categoryId: comic.categoryId,
          id: { not: comicId },
          isActive: true,
        },
        take: limit,
        orderBy: { views: 'desc' },
        select: {
          id: true,
          title: true,
          coverUrl: true,
          description: true,
          author: true,
        },
      })
    }),
  updateImageOrder: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        order: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, order } = input
      return db.comicImage.update({
        where: { id },
        data: { order },
      })
    }),

  deleteImage: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return db.comicImage.delete({ where: { id } })
    }),
  // 增加浏览量
  incrementViews: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.picture.update({
        where: { id: input.id },
        data: { views: { increment: 1 } },
      })
    }),
})
