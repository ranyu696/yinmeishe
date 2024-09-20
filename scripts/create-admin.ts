// scripts/create-admin.ts
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

// 使用 crypto 的 pbkdf2 生成密码哈希的函数
function hashPassword(
  password: string,
): Promise<{ salt: string; hash: string }> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex')
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
        resolve({
          salt: salt,
          hash: derivedKey.toString('hex'),
        })
      },
    )
  })
}

async function createAdminUser() {
  try {
    const email = await question('输入管理员电子邮件: ')
    const username = await question('输入管理员用户名: ')
    const password = await question('输入管理员密码: ')

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      console.log('使用此电子邮件的用户已存在。')
      return
    }

    // 密码加密
    const { salt, hash } = await hashPassword(password)

    // 创建管理员用户
    const user = await prisma.user.create({
      data: {
        email,
        name: username,
        password: hash,
        salt: salt,
        role: 'admin',
      },
    })

    console.log(`Admin user created successfully with id: ${user.id}`)
  } catch (error) {
    console.error('创建管理员用户时出错:', error)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}
createAdminUser().catch(console.error)
