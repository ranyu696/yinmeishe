import { PrismaAdapter } from '@auth/prisma-adapter'
import crypto from 'crypto'
import NextAuth from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '~/server/db'

// 使用 crypto 的 pbkdf2 验证密码的帮助函数
const verifyPassword = (
  password: string,
  salt: string,
  hash: string,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const iterations = 100000
    const keylen = 64
    const digest = 'sha512'

    crypto.pbkdf2(
      password,
      salt,
      iterations,
      keylen,
      digest,
      (err, derivedKey) => {
        if (err) reject(err)
        resolve(derivedKey.toString('hex') === hash) // Compare hash
      },
    )
  })
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null
        }

        const { email, password } = credentials as {
          email: string
          password: string
        }

        if (!email || !password) {
          return null
        }

        // Find user in the database
        const user = await db.user.findUnique({
          where: { email: email },
        })

        if (!user?.password || !user.salt) {
          return null
        }

        // 使用 crypto 的 pbkdf2 验证密码
        const isPasswordValid = await verifyPassword(
          password,
          user.salt,
          user.password,
        )

        if (!isPasswordValid) {
          return null
        }

        // 如果密码有效，则返回用户对象
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  trustHost: true,
  pages: {
    signIn: '/admin-login',
  },
  session: {
    strategy: 'jwt',
  },
})

export const getSession = async () => {
  const session = await auth()
  return session
}
