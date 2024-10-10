import { mkdir } from 'fs/promises'
import { type NextRequest, NextResponse } from 'next/server'
import { dirname, extname, join } from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import { auth } from '~/server/auth'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const category = formData.get('category') as string | null

    if (!file || !category) {
      return NextResponse.json({ error: '缺少文件或分类' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileExtension = extname(file.name)
    const newFileName = `${uuidv4()}${fileExtension}`
    const date = new Date()
    const datePath = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`
    const uploadDir = join(
      process.cwd(),
      'public',
      'uploads',
      'settings',
      category,
      datePath,
    )
    const filePath = join(uploadDir, newFileName)

    // 确保目录存在
    await mkdir(dirname(filePath), { recursive: true })

    // 使用 sharp 处理图片并保存
    const metadata = await sharp(buffer).webp({ quality: 80 }).toFile(filePath)

    const relativePath = `/uploads/settings/${category}/${datePath}/${newFileName}`

    return NextResponse.json({
      filePath: relativePath,
      width: metadata.width,
      height: metadata.height,
    })
  } catch (error) {
    console.error('上传错误:', error)
    return NextResponse.json(
      { error: '上传文件时出错', details: (error as Error).message },
      { status: 500 },
    )
  }
}
