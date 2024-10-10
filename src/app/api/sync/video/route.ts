import axios from 'axios'
import { mkdir } from 'fs/promises'
import { type NextRequest, NextResponse } from 'next/server'
import { dirname, join } from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = (await request.json()) as { imageUrl: unknown }

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: '缺少有效的图片URL' }, { status: 400 })
    }

    // 下载图片
    const response = await axios.get<Buffer>(imageUrl, {
      responseType: 'arraybuffer',
    })
    const buffer = Buffer.from(response.data)

    const newFileName = `${uuidv4()}.webp`
    const date = new Date()
    const datePath = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`
    const uploadDir = join(
      process.cwd(),
      'public',
      'uploads',
      'videos',
      datePath,
    )
    const filePath = join(uploadDir, newFileName)

    // 确保目录存在
    await mkdir(dirname(filePath), { recursive: true })

    // 使用 sharp 处理图片并保存为 WebP
    await sharp(buffer).webp({ quality: 80 }).toFile(filePath)

    const relativePath = `/uploads/videos/${datePath}/${newFileName}`

    return NextResponse.json({ coverUrl: relativePath })
  } catch (error) {
    console.error('同步图片错误:', error)
    return NextResponse.json(
      { error: '同步图片时出错', details: (error as Error).message },
      { status: 500 },
    )
  }
}
