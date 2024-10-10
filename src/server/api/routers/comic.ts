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

// 定义 Comic 和 ComicImage 的 Zod schema
const ComicSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  title: z.string(),
  author: z.string().nullable(),
  description: z.string().nullable(),
  coverUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  views: z.number(),
  isActive: z.boolean(),
})

const ComicImageSchema = z.object({
  id: z.number(),
  chapterId: z.number(),
  path: z.string(),
  width: z.number(),
  height: z.number(),
  size: z.number(),
  mimeType: z.string(),
  order: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const comicRouter = createTRPCRouter({
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
        isActive: isActive ?? undefined,
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
      ComicSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        views: true,
      }).extend({
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      return db.comic.create({
        data: input,
      })
    }),

  updateComic: protectedProcedure
    .input(ComicSchema.partial().extend({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input

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

  bulkDeleteComics: protectedProcedure
    .input(z.array(z.number()))
    .mutation(async ({ input: ids }) => {
      // 使用 Prisma 的 deleteMany 方法批量删除
      const result = await db.comic.deleteMany({
        where: {
          id: { in: ids },
        },
      })

      // 返回删除的记录数
      return { count: result.count }
    }),

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
        const chapter = await tx.comicChapter.findUnique({
          where: { id: chapterId },
          include: { comic: true, images: true },
        })

        if (!chapter) {
          throw new Error('Chapter not found')
        }

        for (const image of chapter.images) {
          const filePath = path.join(process.cwd(), 'public', image.path)
          await fs.remove(filePath).catch(console.error)
        }

        await tx.comicImage.deleteMany({
          where: { chapterId },
        })

        await tx.comicChapter.delete({
          where: { id: chapterId },
        })

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
    .input(ComicImageSchema.pick({ id: true, order: true }))
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

  incrementViews: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.comic.update({
        where: { id: input.id },
        data: { views: { increment: 1 } },
      })
    }),
})
