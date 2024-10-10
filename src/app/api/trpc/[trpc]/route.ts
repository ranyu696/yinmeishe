import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { type NextRequest } from 'next/server'

import { env } from '~/env'
import { appRouter } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { setupBullMQ } from '~/utils/collector'

// 初始化 BullMQ
setupBullMQ()

/**
 *这包装了 `createTRPCContext` 帮助器，并在以下情况下为 tRPC API 提供所需的上下文：
 *处理 HTTP 请求（例如，当您从客户端组件发出请求时）。
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  })
}

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
            )
          }
        : undefined,
  })

export { handler as GET, handler as POST }
