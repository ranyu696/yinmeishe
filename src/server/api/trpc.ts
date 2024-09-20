import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { getSession } from '~/server/auth'
import { db } from '~/server/db'

interface ContextWithSession {
  db: typeof db
  session: Awaited<ReturnType<typeof getSession>>
  headers: Headers
}

export const createTRPCContext = async (opts: {
  headers: Headers
}): Promise<ContextWithSession> => {
  const session = await getSession()
  return {
    db,
    session,
    headers: opts.headers,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createCallerFactory = t.createCallerFactory
export const createTRPCRouter = t.router

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now()
  if (process.env.NODE_ENV === 'development') {
    const waitMs = Math.floor(Math.random() * 400) + 100
    await new Promise((resolve) => setTimeout(resolve, waitMs))
  }
  const result = await next()
  const end = Date.now()
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`)
  return result
})

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  })
})

export const publicProcedure = t.procedure.use(timingMiddleware)
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(authMiddleware)

const isAdminMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session || ctx.session.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next()
})

export const adminProcedure = protectedProcedure.use(isAdminMiddleware)
