import { CategoryType, Prisma } from '@prisma/client'
import { type NextRequest, NextResponse } from 'next/server'
import { db } from '~/server/db'

interface NovelRequestBody {
  title: string
  author: string
  categoryId: string
  description: string
  coverUrl?: string
  externalId?: string
  chapters?: {
    title: string
    content: string
  }[]
}

export async function POST(request: NextRequest) {
  console.log('收到对 /api/receive/novel 的 POST 请求')

  try {
    const settings = await db.ingestSettings.findFirst({
      where: { type: CategoryType.Novel, isEnabled: true },
    })

    if (!settings) {
      return NextResponse.json({ error: '此类型未启用摄取' }, { status: 403 })
    }

    // API 密钥验证
    const authHeader = request.headers.get('authorization')
    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ') ||
      authHeader.split(' ')[1] !== settings.apiKey
    ) {
      return NextResponse.json({ error: 'API 密钥无效' }, { status: 401 })
    }

    const body = (await request.json()) as NovelRequestBody

    // 验证必填字段
    const requiredFields: (keyof NovelRequestBody)[] = [
      'title',
      'author',
      'categoryId',
      'description',
    ]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} 是必填字段` },
          { status: 400 },
        )
      }
    }

    // 准备 Prisma 创建数据
    const novelData: Prisma.NovelCreateInput = {
      title: body.title,
      author: body.author,
      description: body.description,
      coverUrl: body.coverUrl,
      category: { connect: { id: parseInt(body.categoryId, 10) } },
      externalId: body.externalId,
    }

    // 准备章节数据
    const chaptersData: Prisma.NovelChapterCreateManyNovelInput[] =
      body.chapters?.map((chapter, index) => ({
        chapterNumber: index + 1,
        title: chapter.title,
        content: chapter.content,
      })) ?? []

    // 使用事务来确保小说和所有章节一起创建
    const result = await db.$transaction(async (prisma) => {
      const novel = await prisma.novel.create({ data: novelData })

      if (chaptersData.length > 0) {
        await prisma.novelChapter.createMany({
          data: chaptersData.map((chapter) => ({
            ...chapter,
            novelId: novel.id,
          })),
        })
      }

      return novel
    })

    console.log('小说创建成功:', result)
    return NextResponse.json(
      { message: '内容已成功摄取', data: result },
      { status: 201 },
    )
  } catch (error) {
    console.error('处理请求时发生错误:', error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: '小说已存在' }, { status: 409 })
      } else if (error.code === 'P2003') {
        return NextResponse.json({ error: '分类 ID 无效' }, { status: 400 })
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json({ error: '数据验证错误' }, { status: 400 })
    }

    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
