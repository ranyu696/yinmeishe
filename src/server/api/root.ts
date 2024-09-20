import { categoryRouter } from '~/server/api/routers/category'
import { postRouter } from '~/server/api/routers/post'
import { videoRouter } from '~/server/api/routers/video'
import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc'
import { advertisementRouter } from './routers/advertisement'
import { comicRouter } from './routers/comic'
import { friendLinkRouter } from './routers/friendLink'
import { ingestSettingsRouter } from './routers/ingestSettings'
import { novelRouter } from './routers/novel'
import { pictureRouter } from './routers/picture'
import { searchRouter } from './routers/search'
import { systemSettingsRouter } from './routers/settings'
import { tagRouter } from './routers/tag'

/**
 * 这是您服务器的主路由器。
 *
 * /api/routers 中添加的所有路由器都应在此处手动添加。
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  video: videoRouter,
  picture: pictureRouter,
  category: categoryRouter,
  novel: novelRouter,
  advertisement: advertisementRouter,
  friendLink: friendLinkRouter,
  tag: tagRouter,
  ingestSettings: ingestSettingsRouter,
  comic: comicRouter,
  systemSettings: systemSettingsRouter,
  search: searchRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * 为 tRPC API 创建服务器端调用方。
 * @例子
 *
 *
 *
 */
export const createCaller = createCallerFactory(appRouter)
