import { Button } from '@nextui-org/react'
import { type Novel } from '@prisma/client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type Metadata } from 'next'
import Link from 'next/link'
import ChapterContent from '~/app/_components/ChapterContent'
import { api } from '~/trpc/server'

type Props = {
  params: { id: string; chapterId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const novelId = parseInt(params.id)
  const chapterNumber = parseInt(params.chapterId)
  const novel = await api.novel.getById({ id: novelId })
  const chapter = await api.novel.getChapterByNumber({ novelId, chapterNumber })
  const siteName =
    ((await api.systemSettings.getOne({
      category: 'basic',
      key: 'siteName',
    })) as string) || '小新小说'

  if (!novel || !chapter) {
    return {
      title: `章节未找到 - ${siteName}`,
      description: '抱歉，我们找不到您请求的小说章节。',
    }
  }

  const title = `${chapter.title} - ${novel.title} - ${siteName}`
  const description = `阅读 ${novel.title} 的第 ${chapter.chapterNumber} 章：${chapter.title}。由 ${novel.author} 创作的精彩小说。`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'book',
      images: novel.coverUrl ? [novel.coverUrl] : [],
    },
  }
}

export default async function NovelChapterPage({
  params,
}: {
  params: { id: string; chapterId: string }
}) {
  const novelId = parseInt(params.id)
  const chapterNumber = parseInt(params.chapterId)

  const novel = (await api.novel.getById({ id: novelId })) as Novel
  const chapter = (await api.novel.getChapterByNumber({
    novelId,
    chapterNumber,
  }))!
  const prevChapter = await api.novel.getPreviousChapter({
    novelId,
    currentChapterNumber: chapterNumber,
  })
  const nextChapter = await api.novel.getNextChapter({
    novelId,
    currentChapterNumber: chapterNumber,
  })

  if (!novel || !chapter) return <div>章节不存在</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{novel.title}</h1>
        <h2 className="mb-4 text-2xl">
          第 {chapter.chapterNumber} 章：{chapter.title}
        </h2>
      </div>

      <ChapterContent content={chapter.content} />

      <div className="mt-8 flex items-center justify-between">
        {prevChapter ? (
          <Link
            href={`/novels/${novelId}/chapter/${prevChapter.chapterNumber}`}
          >
            <Button
              color="primary"
              variant="ghost"
              startContent={<ChevronLeft />}
            >
              上一章
            </Button>
          </Link>
        ) : (
          <Button disabled>上一章</Button>
        )}

        <Link href={`/novels/${novelId}`}>
          <Button color="primary" variant="bordered">
            返回目录
          </Button>
        </Link>

        {nextChapter ? (
          <Link
            href={`/novels/${novelId}/chapter/${nextChapter.chapterNumber}`}
          >
            <Button
              color="primary"
              variant="ghost"
              endContent={<ChevronRight />}
            >
              下一章
            </Button>
          </Link>
        ) : (
          <Button disabled>下一章</Button>
        )}
      </div>
    </div>
  )
}
