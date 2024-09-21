import { Button, Card, CardBody, Image } from '@nextui-org/react'
import { type Novel, type NovelChapter } from '@prisma/client'
import { BookOpen } from 'lucide-react'
import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import NovelCard from '~/app/_components/Card/NovelCard'
import { api } from '~/trpc/server'

type NovelWithChapters = Novel & {
  chapters: NovelChapter[]
}

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const novelId = parseInt(params.id)
  const novel = await api.novel.getById({ id: novelId })
  const siteName =
    ((await api.systemSettings.getOne({
      category: 'general',
      key: 'siteName',
    })) as string) || '小新小说'

  if (!novel) {
    return {
      title: `小说未找到 - ${siteName}`,
      description: '抱歉，我们找不到您请求的小说。',
    }
  }

  const title = `${novel.title} - 作者:${novel.author} - ${siteName}`
  const description =
    novel.description ||
    `阅读 ${novel.title}，由 ${novel.author} 创作的精彩小说。`

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
export default async function NovelDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const novelId = parseInt(params.id)
  const novel = (await api.novel.getById({ id: novelId })) as NovelWithChapters
  const relatedNovels = (await api.novel.getRelatedNovels({
    novelId,
    limit: 4,
  })) as Novel[]

  if (!novel) return notFound()

  return (
    <div className="m-2 mx-auto">
      <Card className="mb-4">
        <CardBody>
          <div className="flex flex-col md:flex-row">
            <div className="mb-4 md:mb-0 md:w-1/4">
              <Image
                src={novel.coverUrl ?? '/placeholder.png'}
                alt={novel.title}
                width={200}
                height={300}
                className="w-full object-cover"
              />
            </div>
            <div className="md:w-3/4 md:pl-8">
              <h1 className="mb-4 text-3xl font-bold">{novel.title}</h1>
              <p className="mb-2 text-xl">作者: {novel.author}</p>
              <p className="mb-4 text-gray-600">{novel.description}</p>
              <div className="mb-4 flex items-center">
                <BookOpen className="mr-2" />
                <span>{novel.chapters.length} 章节</span>
              </div>
              <Link href={`/novels/${novel.id}/chapter/1`}>
                <Button color="primary">开始阅读</Button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>

      <h2 className="mb-4 text-2xl font-semibold">章节列表</h2>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {novel.chapters.map((chapter) => (
          <Link key={chapter.id} href={`/novels/${novel.id}/chapter/${chapter.chapterNumber}`}>
            <Button size="sm" variant="bordered" className="w-full">
              第 {chapter.chapterNumber} 章
            </Button>
          </Link>
        ))}
      </div>

      <h2 className="mb-4 text-2xl font-semibold">相关推荐</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {relatedNovels.map((relatedNovel) => (
          <NovelCard key={relatedNovel.id} novel={relatedNovel} />
        ))}
      </div>
    </div>
  )
}
