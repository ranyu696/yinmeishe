import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
  },

  /**
   * 在此处指定您的客户端环境变量架构。这样你就可以确保应用程序
   * 不是使用无效的环境变量构建的。要将它们公开给客户端，请在它们前面添加前缀
   * `NEXT_PUBLIC_`。
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * 您无法将“process.env”作为 Next.js 边缘运行时中的常规对象进行破坏（例如
   * 中间件）或客户端，因此我们需要手动销毁。
   */
  runtimeEnv: {
    REDIS_URL: process.env.REDIS_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    AUTH_SECRET: process.env.AUTH_SECRET,
    // NEXT_PUBLIC_CLIENTVAR：process.env.NEXT_PUBLIC_CLIENTVAR，
  },
  /**
   * 使用“SKIP_ENV_VALIDATION”运行“build”或“dev”以跳过环境验证。这尤其是
   * 对于 Docker 构建很有用。
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * 使空字符串被视为未定义。 `SOME_VAR: z.string()` 和
   * `SOME_VAR=''` 将抛出错误。
   */
  emptyStringAsUndefined: true,
})
