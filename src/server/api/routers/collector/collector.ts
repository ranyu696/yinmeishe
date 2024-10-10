import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'
import { queueEvents, videoQueue } from '~/utils/collector'

interface CollectionProgressData {
  apiId: number
  collectionId: string
  progress: number
  status: 'FETCHING_LIST' | 'PROCESSING_VIDEOS' | 'COMPLETED' | 'FAILED';
  currentPage?: number
  totalPages?: number
  currentVideo?: number
  totalVideos?: number
}

interface CollectionNotificationData {
  apiId: number
  mode: string
  status: 'COMPLETED' | 'FAILED'
}

export const collectorRouter = createTRPCRouter({
  startCollection: protectedProcedure
    .input(
      z.object({
        apiId: z.number(),
        mode: z.enum(['all', 'hours', 'specific']),
        hours: z.number().optional(),
        resourceIds: z.array(z.string()).optional(),
        categoryId: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { apiId, mode, hours, resourceIds, categoryId } = input
      const api = await ctx.db.externalApi.findUnique({ where: { id: apiId } })
      if (!api)
        throw new TRPCError({ code: 'NOT_FOUND', message: 'API not found' })

      const categoryMappings = await ctx.db.categoryMapping.findMany({
        where: { externalApiId: apiId },
      })

      const mappedCategoryMappings = categoryMappings.map((mapping) => ({
        externalId: mapping.externalId,
        internalId: mapping.internalId,
      }))

      const collectionId = `${apiId}-${Date.now()}`

      await videoQueue.add('collectVideos', {
        apiUrl: api.url,
        collectionId,
        mode,
        options: {
          hours,
          categoryMappings: mappedCategoryMappings,
          syncImages: api.isActive,
          resourceIds,
          categoryId,
        },
      })

      return { message: '征集开始', collectionId }
    }),

  getCollectionNotifications: protectedProcedure.subscription(() => {
    return observable<CollectionNotificationData>((emit) => {
      const onCompleted = ({ returnvalue }: { returnvalue: string }) => {
        const data = JSON.parse(returnvalue) as CollectionNotificationData
        emit.next({ ...data, status: 'COMPLETED' })
      }

      const onFailed = ({ failedReason }: { failedReason: string }) => {
        const data = JSON.parse(failedReason) as CollectionNotificationData
        emit.next({ ...data, status: 'FAILED' })
      }

      queueEvents.on('completed', onCompleted)
      queueEvents.on('failed', onFailed)

      return () => {
        queueEvents.off('completed', onCompleted)
        queueEvents.off('failed', onFailed)
      }
    })
  }),

  getCollectionProgress: protectedProcedure.subscription(() => {
    return observable<CollectionProgressData>((emit) => {
      const onProgress = (
        args: { jobId: string; data: number | object },
        _id: string,
      ) => {
        let progressData: CollectionProgressData

        if (typeof args.data === 'number') {
          progressData = {
            apiId: 0, // 使用一个默认值或从上下文中获取
            collectionId: args.jobId, // 使用 jobId 作为 collectionId
            progress: args.data,
            status: 'PROCESSING_VIDEOS', // 使用一个默认状态
          }
        } else if (
          typeof args.data === 'object' &&
          'apiId' in args.data &&
          'collectionId' in args.data &&
          'status' in args.data
        ) {
          progressData = args.data as CollectionProgressData
        } else {
          console.error('Invalid progress data:', args.data)
          return // 不发射无效的数据
        }

        emit.next(progressData)
      }

      queueEvents.on('progress', onProgress)

      return () => {
        queueEvents.off('progress', onProgress)
      }
    })
  }),
})
