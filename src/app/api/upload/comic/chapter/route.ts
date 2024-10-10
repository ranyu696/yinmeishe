import { mkdir } from 'fs/promises'
import { type NextRequest, NextResponse } from 'next/server'
import { dirname, join } from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import { db } from '~/server/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const comicId = Number(formData.get('comicId'))
    const chapterNumber = Number(formData.get('chapterNumber'))
    const order = Number(formData.get('order'))

    if (!file || !comicId || !chapterNumber) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${Date.now()}_${uuidv4()}.webp`
    const chapterDir = join(
      process.cwd(),
      'public',
      'uploads',
      'comics',
      comicId.toString(),
      `chapter${chapterNumber}`,
    )
    const filepath = join(chapterDir, filename)

    // 确保目录存在
    await mkdir(dirname(filepath), { recursive: true })

    const metadata = await sharp(buffer).webp({ quality: 80 }).toFile(filepath)

    const relativePath = `/uploads/comics/${comicId}/chapter${chapterNumber}/${filename}`

    // 获取章节信息
    const chapter = await db.comicChapter.findFirst({
      where: { comicId, chapterNumber },
      select: { id: true },
    })

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // 创建新的 ComicImage 记录
    const comicImage = await db.comicImage.create({
      data: {
        chapterId: chapter.id,
        path: relativePath,
        width: metadata.width,
        height: metadata.height,
        size: metadata.size,
        mimeType: 'image/webp',
        order,
      },
    })

    return NextResponse.json({
      imagePath: relativePath,
      imageId: comicImage.id,
      ...metadata,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: '上传文件时出错', details: (error as Error).message },
      { status: 500 },
    )
  }
}
