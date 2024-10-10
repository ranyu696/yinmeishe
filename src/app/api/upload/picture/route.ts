import { PrismaClient } from '@prisma/client'
import { mkdir } from 'fs/promises'
import { type NextRequest, NextResponse } from 'next/server'
import { dirname, join } from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const pictureId = Number(formData.get('pictureId'))

    if (!file || !pictureId) {
      return NextResponse.json({ error: '缺少文件或图片 ID' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const newFileName = `${uuidv4()}.webp`
    const uploadDir = join(
      process.cwd(),
      'public',
      'uploads',
      'pictures',
      pictureId.toString(),
    )
    const filePath = join(uploadDir, newFileName)

    // 确保目录存在
    await mkdir(dirname(filePath), { recursive: true })

    // 直接使用 sharp 处理图片并保存为 WebP
    const imageInfo = await sharp(buffer).webp({ quality: 80 }).toFile(filePath)

    const relativePath = `/uploads/pictures/${pictureId}/${newFileName}`

    const newImage = await prisma.pictureImage.create({
      data: {
        path: relativePath,
        width: imageInfo.width,
        height: imageInfo.height,
        size: imageInfo.size,
        mimeType: 'image/webp',
        pictureId,
        order: (await prisma.pictureImage.count({ where: { pictureId } })) + 1,
      },
    })

    const picture = await prisma.picture.findUnique({
      where: { id: pictureId },
    })
    if (!picture?.coverUrl) {
      await prisma.picture.update({
        where: { id: pictureId },
        data: { coverUrl: newImage.path },
      })
    }

    return NextResponse.json(newImage)
  } catch (error) {
    console.error('上传错误:', error)
    return NextResponse.json(
      { error: '上传文件时出错', details: (error as Error).message },
      { status: 500 },
    )
  }
}
