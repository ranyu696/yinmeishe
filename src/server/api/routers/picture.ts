import { type Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import fs from 'fs-extra'
import path from 'path'
import { z } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'
import { db } from '~/server/db'

export const pictureRouter = createTRPCRouter({
  // 获取图片集列表
  getAll: publicProcedure
    .input(
      z.object({
        isActive: z.boolean().optional(),
        page: z.number().default(1),
        search: z.string().optional(),
        perPage: z.number().default(20),
        categoryId: z.number().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { isActive, page, search, perPage, categoryId } = input
      const skip = (page - 1) * perPage

      const where: Prisma.PictureWhereInput = {}

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      if (categoryId) {
        where.categoryId = categoryId
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      const [pictures, total] = await Promise.all([
        ctx.db.picture.findMany({
          where,
          skip,
          take: perPage,
          include: {
            category: true,
            images: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        ctx.db.picture.count({ where }),
      ])

      return {
        pictures,
        total,
        page,
        perPage,
        pages: Math.ceil(total / perPage),
      }
    }),

  // 获取单个图片集详情
  getById: publicProcedure
    .input(z.number())
    .query(async ({ input: id, ctx }) => {
      return ctx.db.picture.findUnique({
        where: { id },
        include: {
          category: true,
          images: {
            orderBy: { order: 'asc' },
          },
        },
      })
    }),

  // 创建新的图片集
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        categoryId: z.number(),
        coverUrl: z.string().optional(),
        isActive: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.picture.create({
        data: input,
      })
    }),

  // 更新图片集
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        categoryId: z.number().optional(),
        coverUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input
      return ctx.db.picture.update({
        where: { id },
        data,
      })
    }),

  // 删除图片集
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const picture = await db.picture.findUnique({
        where: { id: input.id },
        include: { images: true },
      })

      if (!picture) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Picture not found' })
      }

      // 使用事务来确保数据一致性
      return await db.$transaction(async (tx) => {
        // 删除所有关联图像文件
        for (const image of picture.images) {
          try {
            const fullPath = path.join(process.cwd(), 'public', image.path)
            await fs.remove(fullPath)
          } catch (error) {
            console.error(`删除图像文件失败: ${image.path}`, error)
            // 继续删除其他图片，但可能需要记录这个错误
          }
        }

        // 删除图片集的目录
        try {
          const pictureDir = path.join(
            process.cwd(),
            'public',
            'uploads',
            'pictures',
            input.id.toString(),
          )
          await fs.remove(pictureDir)
        } catch (error) {
          console.error(`删除图片集目录失败: ${input.id}`, error)
          // 继续执行，但可能需要记录这个错误
        }

        // 从数据库中删除图片和所有关联图像
        await tx.pictureImage.deleteMany({ where: { pictureId: input.id } })
        await tx.picture.delete({ where: { id: input.id } })

        return { success: true }
      })
    }),

  // 删除单张图片
  deleteImage: protectedProcedure
    .input(
      z.object({
        imageId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db.$transaction(async (tx) => {
        const image = await tx.pictureImage.findUnique({
          where: { id: input.imageId },
        })
        if (!image) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '找不到图片' })
        }

        try {
          const fullPath = path.join(process.cwd(), 'public', image.path)
          await fs.remove(fullPath)
        } catch (error) {
          console.error('删除图像文件时出错:', error)
          // 即使文件删除失败，我们也继续删除数据库记录
        }

        await tx.pictureImage.delete({ where: { id: input.imageId } })

        // 如果这是封面图片，更新图片集
        const picture = await tx.picture.findUnique({
          where: { id: image.pictureId },
        })
        if (picture && picture.coverUrl === image.path) {
          const newCoverUrl = await tx.pictureImage.findFirst({
            where: { pictureId: picture.id },
            orderBy: { order: 'asc' },
          })
          await tx.picture.update({
            where: { id: picture.id },
            data: { coverUrl: newCoverUrl?.path ?? null },
          })
        }

        // 重新排序剩余的图片
        const remainingImages = await tx.pictureImage.findMany({
          where: { pictureId: image.pictureId },
          orderBy: { order: 'asc' },
        })

        await Promise.all(
          remainingImages.map((img, index) => {
            return tx.pictureImage.update({
              where: { id: img.id },
              data: { order: index + 1 },
            })
          }),
        )

        return { success: true }
      })
    }),

  // 更新图片顺序
  updateImageOrder: protectedProcedure
    .input(
      z.object({
        pictureId: z.number(),
        imageOrders: z.array(
          z.object({
            id: z.number(),
            order: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const { imageOrders } = input

      for (const { id, order } of imageOrders) {
        await db.pictureImage.update({
          where: { id },
          data: { order },
        })
      }

      return { success: true }
    }),

  // 设置封面图片
  setCoverUrl: protectedProcedure
    .input(
      z.object({
        pictureId: z.number(),
        imageId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const { pictureId, imageId } = input

      const image = await db.pictureImage.findUnique({ where: { id: imageId } })

      if (image === null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '图片未找到',
        })
      }

      if (image.pictureId !== pictureId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '图片不属于此图集',
        })
      }

      await db.picture.update({
        where: { id: pictureId },
        data: { coverUrl: image.path },
      })

      return { success: true }
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
