// src/utils/collector.ts
import { TRPCError } from '@trpc/server'
import axios from 'axios'
import { Queue, QueueEvents, Worker, type Job } from 'bullmq'
import fs from 'fs'
import Redis from 'ioredis'
import path from 'path'
import { db } from '~/server/db'
import type {
  CategoryListResponse,
  ExternalCategory,
  VideoDetailsResponse,
  VideoListResponse,
  VideoResource,
} from '~/types'

// Redis 连接配置
const connection = new Redis({
  maxRetriesPerRequest: null,
})
// 采集选项接口定义
export interface CollectionOptions {
  hours?: number
  categoryMappings: Array<{ externalId: number; internalId: number }>
  syncImages: boolean
  resourceIds?: string[]
  categoryId?: number
}

// 创建视频处理队列
export const videoQueue = new Queue('视频处理', { connection })

// 任务数据接口定义
interface JobData {
  apiUrl: string
  collectionId: string
  mode: 'all' | 'hours' | 'specific'
  options: CollectionOptions
}

// 创建工作者
export const createWorker = () => {
  return new Worker<JobData>(
    '视频处理',
    async (job) => {
      const { apiUrl, collectionId, mode, options } = job.data
      await collectVideos(apiUrl, collectionId, mode, options, job)
    },
    { connection },
  )
}

// 创建队列事件监听器
export const queueEvents = new QueueEvents('视频处理', { connection })

// 设置 BullMQ
export function setupBullMQ() {
  const worker = createWorker()

  worker.on('completed', (job: Job<JobData>) => {
    console.log(`工作 ${job.id} 已完成!`)
  })

  worker.on('failed', (job: Job<JobData> | undefined, err: Error) => {
    console.error(`工作 ${job?.id ?? 'unknown'} 失败了 ${err.message}`)
  })

  queueEvents.on('progress', ({ jobId, data }) => {
    console.log(`工作 ${jobId} 进度: ${JSON.stringify(data)}`)
  })
}
// 主要的视频采集函数
export async function collectVideos(
  apiUrl: string,
  collectionId: string,
  mode: 'all' | 'hours' | 'specific',
  options: CollectionOptions,
  job: Job,
) {
  const apiId = parseInt(collectionId?.split('-')[0] ?? '0', 10);
  const batchSummary = {
    processed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  }
  let lastProgressUpdate = 0
  const updateInterval = 5000 // 5秒更新一次进度

  try {
    console.log(`开始采集视频, API ID: ${apiId}, 模式: ${mode}`)

    const videoIds = await fetchVideoIds(
      apiUrl,
      mode,
      options,
      job,
      apiId,
      collectionId,
    )
    console.log(`共收集到 ${videoIds.length} 个视频ID`)

    const batchSize = 20
    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize)
      console.log(
        `正在处理批次 ${Math.floor(i / batchSize) + 1}, 视频ID范围: ${i + 1} - ${Math.min(i + batchSize, videoIds.length)}`,
      )

      const detailsResponse = await fetchVideoDetails(apiUrl, batch.map(String))
      const videoList = detailsResponse.list

      for (const video of videoList) {
        if (video) {
          const startTime = Date.now()
          try {
            const mapping = options.categoryMappings.find(
              (m) => m.externalId === video.type_id,
            )
            if (mapping) {
              const result = await processVideo(video, {
                externalId: mapping.externalId,
                internalId: mapping.internalId,
                syncImages: options.syncImages,
              })
              batchSummary[result.status]++
              batchSummary.processed++
              console.log(
                `处理视频 ${video.vod_name} 完成, 状态: ${result.status}, 耗时: ${Date.now() - startTime}ms`,
              )
            } else {
              console.warn(
                `未找到外部类别 ID 的类别映射: ${video.type_id}, 视频: ${video.vod_name}`,
              )
              batchSummary.skipped++
            }
          } catch (error) {
            console.error(`处理视频时出错: ${video.vod_name}`, error)
            batchSummary.failed++
          }
        }
      }

      // 更新进度
      const progress = Math.round(((i + batch.length) / videoIds.length) * 100)
      if (Date.now() - lastProgressUpdate > updateInterval) {
        await job.updateProgress({
          apiId,
          collectionId,
          progress,
          status: 'PROCESSING_VIDEOS',
          currentVideo: i + batch.length,
          totalVideos: videoIds.length,
          ...batchSummary,
        })
        lastProgressUpdate = Date.now()
      }

      console.log(
        `批次处理总结 (${i + 1} 到 ${Math.min(i + batchSize, videoIds.length)}): `,
        batchSummary,
      )
    }

    // 发送最终的进度更新
    await job.updateProgress({
      apiId,
      collectionId,
      progress: 100,
      status: 'COMPLETED',
      currentVideo: videoIds.length,
      totalVideos: videoIds.length,
      ...batchSummary,
    })

    console.log('采集完成总结: ', batchSummary)
    return { apiId, mode, summary: batchSummary }
  } catch (error) {
    console.error('采集时出错:', error)
    throw new Error(
      JSON.stringify({
        apiId,
        mode,
        error: error instanceof Error ? error.message : String(error),
      }),
    )
  }
}
// 获取视频ID列表
async function fetchVideoIds(
  apiUrl: string,
  mode: 'all' | 'hours' | 'specific',
  options: CollectionOptions,
  job: Job,
  apiId: number,
  collectionId: string,
): Promise<number[]> {
  if (
    mode === 'specific' &&
    options.resourceIds &&
    options.resourceIds.length > 0
  ) {
    console.log(`使用特定资源ID模式, 共 ${options.resourceIds.length} 个ID`)
    return options.resourceIds.map(Number)
  }

  let videoIds: number[] = []
  let currentPage = 1
  let totalPages = 1

  console.log(`开始获取视频ID列表, 模式: ${mode}`)

  do {
    const startTime = Date.now()
    const { videoList, totalPages: pages } = await fetchVideoList(
      apiUrl,
      mode,
      {
        hours: options.hours,
        categoryId: options.categoryId,
        page: currentPage,
      },
    )

    totalPages = pages

    if (videoList.list && Array.isArray(videoList.list)) {
      const newIds = videoList.list.map((item) => item.vod_id)
      videoIds = videoIds.concat(newIds)
      console.log(
        `页面 ${currentPage}/${totalPages} 获取了 ${newIds.length} 个视频ID, 耗时: ${Date.now() - startTime}ms`,
      )
    } else {
      console.warn('意外的 videoList 结构:', videoList)
    }

    const listProgress = Math.round((currentPage / totalPages) * 50)
    await job.updateProgress({
      apiId,
      collectionId,
      progress: listProgress,
      status: 'FETCHING_LIST',
      currentPage,
      totalPages,
    })

    currentPage++
  } while (currentPage <= totalPages)

  console.log(`视频ID列表获取完成, 总共 ${videoIds.length} 个ID`)
  return videoIds
}

// 获取视频列表
export async function fetchVideoList(
  apiUrl: string,
  mode: 'all' | 'hours' | 'specific',
  options?: {
    hours?: number
    categoryId?: number
    page?: number
  },
): Promise<{
  videoList: VideoListResponse
  totalPages: number
  currentPage: number
}> {
  try {
    let url = `${apiUrl}&ac=list`

    if (options?.categoryId !== undefined) {
      url += `&t=${options.categoryId}`
    }

    if (options?.page !== undefined) {
      url += `&pg=${options.page}`
    }

    if (mode === 'hours' && options?.hours) {
      url += `&h=${options.hours}`
    }

    const response = await axios.get<VideoListResponse>(url)
    console.log(
      `已获取视频列表 ${mode} mode, 页码: ${response.data.page}, 总页数: ${response.data.pagecount}`,
    )

    return {
      videoList: response.data,
      totalPages: parseInt(response.data.pagecount, 10),
      currentPage: parseInt(response.data.page, 10),
    }
  } catch (error) {
    console.error(
      `获取视频列表时出错: ${error instanceof Error ? error.message : String(error)}`,
    )
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `获取视频列表时出错: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}

// 获取视频详细信息
export async function fetchVideoDetails(
  apiUrl: string,
  ids: string[],
): Promise<VideoDetailsResponse> {
  try {
    const url = `${apiUrl}&ac=detail&ids=${ids.join(',')}`
    const response = await axios.get<VideoDetailsResponse>(url)
    console.log(`已获取详细信息 ${ids.length} 视频`)
    return response.data
  } catch (error) {
    console.error(
      `获取视频详细信息时出错: ${error instanceof Error ? error.message : String(error)}`,
    )
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `获取视频详细信息时出错: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}

// 处理单个视频函数
async function processVideo(
  videoData: VideoResource,
  options: {
    externalId: number
    internalId: number
    syncImages: boolean
  },
): Promise<{ status: 'created' | 'updated' | 'skipped' }> {
  console.log(`开始处理视频: ${videoData.vod_name}`)

  try {
    const existingVideo = await db.video.findFirst({
      where: { title: videoData.vod_name },
      include: { videoSources: true },
    })

    if (existingVideo) {
      const newPlayUrl = videoData.vod_play_url.split('$').pop()
      if (newPlayUrl) {
        const existingSource = existingVideo.videoSources.find(
          (source) => source.playUrl === newPlayUrl,
        )

        if (!existingSource) {
          await db.videoSource.create({
            data: {
              videoId: existingVideo.id,
              playUrl: newPlayUrl,
              playerType: videoData.vod_play_from ?? 'dplayer',
            },
          })
          console.log(`新增视频播放源: ${existingVideo.title}`)
          return { status: 'updated' }
        } else {
          console.log(`视频的播放源已存在: ${existingVideo.title}`)
        }
      }

      // 同步图片
      if (options.syncImages) {
        const localImagePath = path.join(
          process.cwd(),
          'public',
          existingVideo.coverUrl,
        )
        const imageExists = fs.existsSync(localImagePath)

        if (!imageExists) {
          const newCoverUrl = await syncImage(videoData.vod_pic)
          if (newCoverUrl !== existingVideo.coverUrl) {
            await db.video.update({
              where: { id: existingVideo.id },
              data: { coverUrl: newCoverUrl },
            })
            console.log(`更新了视频封面: ${existingVideo.title}`)
            return { status: 'updated' }
          }
        } else {
          console.log(`视频封面已存在本地: ${existingVideo.title}`)
        }
      }

      return { status: 'skipped' }
    } else {
      const newCoverUrl = options.syncImages
        ? await syncImage(videoData.vod_pic)
        : videoData.vod_pic
      const newVideo = await db.video.create({
        data: {
          title: videoData.vod_name,
          description: videoData.vod_content,
          coverUrl: newCoverUrl,
          categoryId: options.internalId,
          videoSources: {
            create: {
              playUrl: videoData.vod_play_url.split('$').pop() ?? '',
              playerType: videoData.vod_play_from ?? 'dplayer',
            },
          },
        },
      })
      console.log(`创建了新视频: ${newVideo.title}`)
      return { status: 'created' }
    }
  } catch (error) {
    console.error(`处理视频时出错: ${videoData.vod_name}`, error)
    throw error
  }
}
// 同步图片
async function syncImage(imageUrl: string): Promise<string> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_API_URL 没有定义')
    }

    const response = await fetch(`${apiUrl}/api/sync/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    })

    if (!response.ok) {
      throw new Error('图像同步失败')
    }

    const data = (await response.json()) as { coverUrl: string }
    return data.coverUrl
  } catch (error) {
    console.error('同步图片时出错:', error)
    // 如果同步失败，返回原始 URL
    return imageUrl
  }
}

// 获取外部分类
export async function fetchExternalCategories(
  apiUrl: string,
): Promise<ExternalCategory[]> {
  try {
    const response = await axios.get<CategoryListResponse>(apiUrl)
    if (!response.data.class || !Array.isArray(response.data.class)) {
      throw new Error('响应格式无效')
    }
    console.log(`已获取 ${response.data.class.length} 个外部分类`)
    return response.data.class.map((category) => ({
      type_id: category.type_id,
      type_name: category.type_name,
    }))
  } catch (error) {
    console.error(
      `获取外部分类时出错: ${error instanceof Error ? error.message : String(error)}`,
    )
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `获取外部分类时出错: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}
