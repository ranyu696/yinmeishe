// src/server/api/routers/search.ts
import { PrismaClient } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import Redis from 'ioredis'
import { z } from 'zod'
import { getSystemSetting } from '~/utils/settings'
import { createTRPCRouter, publicProcedure } from '../trpc'

const prisma = new PrismaClient()
const redis = new Redis(process.env.REDIS_URL ?? '')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const searchResultSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  type: z.enum(['novel', 'comic', 'picture', 'video']),
  createdAt: z.date(),
  coverUrl: z.string().nullable(),
})

type SearchResult = z.infer<typeof searchResultSchema>

export const searchRouter = createTRPCRouter({
  performSearch: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, '搜索词不能为空'),
        type: z
          .enum(['all', 'novel', 'comic', 'picture', 'video'])
          .default('all'),
        page: z.number().int().positive().default(1),
      }),
    )
    .query(async ({ input }) => {
      const { query, type, page } = input
      const pageSize = 20
      const skip = (page - 1) * pageSize

      try {
        // 获取缓存设置
        const cacheEnabled =
          (await getSystemSetting('performance', 'searchCacheEnabled')) ===
          'false'
        const cacheTime = parseInt(
          (await getSystemSetting('performance', 'searchCacheTime')) ?? '3600',
          10,
        )

        let results: SearchResult[] = []

        if (cacheEnabled) {
          // 尝试从缓存获取结果
          const cacheKey = `search:${type}:${query}:${page}`
          const cachedResults = await redis.get(cacheKey)
          if (cachedResults) {
            return JSON.parse(cachedResults) as SearchResult[]
          }
        }

        // 如果缓存中没有或缓存被禁用，执行搜索
        if (type === 'all') {
          results = await Promise.all([
            searchNovel(query, skip, pageSize),
            searchComic(query, skip, pageSize),
            searchPicture(query, skip, pageSize),
            searchVideo(query, skip, pageSize),
          ]).then((results) => results.flat())
        } else {
          switch (type) {
            case 'novel':
              results = await searchNovel(query, skip, pageSize)
              break
            case 'comic':
              results = await searchComic(query, skip, pageSize)
              break
            case 'picture':
              results = await searchPicture(query, skip, pageSize)
              break
            case 'video':
              results = await searchVideo(query, skip, pageSize)
              break
          }
        }

        if (cacheEnabled) {
          // 缓存结果
          await redis.set(
            `search:${type}:${query}:${page}`,
            JSON.stringify(results),
            'EX',
            cacheTime,
          )
        }

        return results
      } catch (error) {
        console.error('Search error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '搜索过程中发生错误',
        })
      }
    }),

  // 可以添加其他搜索相关的方法，如获取搜索建议等
})

async function searchNovel(
  query: string,
  skip: number,
  take: number,
): Promise<SearchResult[]> {
  const novels = await prisma.novel.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  })

  return novels.map((novel) => ({
    id: novel.id,
    title: novel.title,
    description: novel.description,
    url: `/novels/${novel.id}`,
    type: 'novel',
    createdAt: novel.createdAt,
    coverUrl: novel.coverUrl,
  }))
}

async function searchComic(
  query: string,
  skip: number,
  take: number,
): Promise<SearchResult[]> {
  const comics = await prisma.comic.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  })

  return comics.map((comic) => ({
    id: comic.id,
    title: comic.title,
    description: comic.description,
    url: `/comics/${comic.id}`,
    type: 'comic',
    createdAt: comic.createdAt,
    coverUrl: comic.coverUrl,
  }))
}

async function searchPicture(
  query: string,
  skip: number,
  take: number,
): Promise<SearchResult[]> {
  const pictures = await prisma.picture.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  })

  return pictures.map((picture) => ({
    id: picture.id,
    title: picture.title,
    description: picture.description,
    url: `/pictures/${picture.id}`,
    type: 'picture',
    createdAt: picture.createdAt,
    coverUrl: picture.coverUrl,
  }))
}

async function searchVideo(
  query: string,
  skip: number,
  take: number,
): Promise<SearchResult[]> {
  const videos = await prisma.video.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  })

  return videos.map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    url: `/videos/${video.id}`,
    type: 'video',
    createdAt: video.createdAt,
    coverUrl: video.coverUrl,
  }))
}
