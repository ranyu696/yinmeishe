import { CategoryType, Prisma } from '@prisma/client'
import { type NextRequest, NextResponse } from 'next/server'
import { db } from '~/server/db'

export async function POST(request: NextRequest) {
  console.log('收到对 /api/receive/novel 的 POST 请求')

  try {
    const settings = await db.ingestSettings.findFirst({
      where: { type: CategoryType.Novel, isEnabled: true },
    })

    console.log('摄取设置:', settings)

    if (!settings) {
      console.log('No enabled ingest settings found for Novel type')
      return NextResponse.json({ error: '此类型未启用摄取' }, { status: 403 })
    }

    // API 密钥验证
    const authHeader = request.headers.get('authorization')
    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ') ||
      authHeader.split(' ')[1] !== settings.apiKey
    ) {
      console.log('API 密钥验证失败')
      return NextResponse.json({ error: 'API 密钥无效' }, { status: 401 })
    }

    console.log('API 密钥验证成功')

    const formData = await request.formData()
    const fields: Record<string, string> = {}
    for (const [key, value] of formData.entries()) {
      fields[key] = value as string
    }

    console.log('解析的表单字段:', fields)

    // 验证必填字段
    if (
      !fields.title ||
      !fields.author ||
      !fields.categoryId ||
      !fields.description
    ) {
      return NextResponse.json(
        { error: '标题、作者和分类ID是必填字段' },
        { status: 400 },
      )
    }

    // 准备 Prisma 创建数据
    const novelData: Prisma.NovelCreateInput = {
      title: fields.title,
      author: fields.author,
      description: fields.description ?? undefined,
      coverUrl: fields.coverUrl ?? undefined,
      category: {
        connect: { id: parseInt(fields.categoryId, 10) },
      },
    }

    console.log('准备好的小说数据:', novelData)

    try {
      const result = await db.novel.create({ data: novelData })
      console.log('小说创建成功:', result)

      // 处理章节信息（如果提供）
      if (fields.chapterTitle && fields.chapterContent) {
        const chapterData: Prisma.NovelChapterCreateInput = {
          novel: { connect: { id: result.id } },
          chapterNumber: 1, // 假设这是第一章
          title: fields.chapterTitle,
          content: fields.chapterContent,
        }

        const chapterResult = await db.novelChapter.create({
          data: chapterData,
        })
        console.log('章节创建成功:', chapterResult)
      }

      return NextResponse.json(
        { message: '内容已成功摄取', data: result },
        { status: 200 },
      )
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma 已知错误:', error.code, error.message, error.meta)
        if (error.code === 'P2002') {
          return NextResponse.json({ error: '小说已存在' }, { status: 409 })
        } else if (error.code === 'P2003') {
          return NextResponse.json({ error: '分类 ID 无效' }, { status: 400 })
        }
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        console.error('Prisma 验证错误:', error.message)
        return NextResponse.json({ error: '数据验证错误' }, { status: 400 })
      } else {
        console.error('未知错误:', error)
      }
      return NextResponse.json({ error: '内容入库时出错' }, { status: 500 })
    }
  } catch (error) {
    console.error('意外错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
