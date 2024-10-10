import { Button, Card, CardBody, Image, Tooltip } from '@nextui-org/react'
import { type ComicChapter } from '@prisma/client'
import { BookOpen } from 'lucide-react'
import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ComicCard from '~/app/_components/Card/ComicCard'
import { api } from '~/trpc/server'

type ComicWithChapters = {
  id: number
  title: string
  author: string
  description: string
  coverUrl: string | null
  chapters: ComicChapter[]
}
type RelatedComic = {
  id: number
  title: string
  author: string
  description: string
  coverUrl: string | null
}
type Props = {
  params: { comicId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const comicId = parseInt(params.comicId)
  const comic = await api.comic.getById(comicId)
  const siteName =
    ((await api.systemSettings.getOne({
      category: 'basic',
      key: 'siteName',
    })) as string) || '小新漫画'

  if (!comic) {
    return {
      title: `漫画未找到 - ${siteName}`,
      description: '抱歉，我们找不到您请求的漫画。',
    }
  }

  const title = `${comic.title} - ${comic.author} - ${siteName}`
  const description =
    comic.description ??
    `阅读 ${comic.title}，由 ${comic.author} 创作的精彩漫画。`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'book',
      images: comic.coverUrl ? [comic.coverUrl] : [],
    },
  }
}

export default async function ComicDetail({
  params,
}: {
  params: { comicId: string }
}) {
  const comic = (await api.comic.getById(
    parseInt(params.comicId),
  )) as ComicWithChapters
  const relatedComics = (await api.comic.getRelatedComics({
    comicId: comic.id,
    limit: 4,
  })) as RelatedComic[]

  if (!comic) return notFound()

  return (
    <div className="m-2 mx-auto">
      <Card className="w-full overflow-hidden">
        <CardBody className="p-0">
          <div className="flex flex-col lg:flex-row">
            <div className="relative flex w-full justify-center lg:w-1/3 lg:justify-start">
              <div className="mb-4 h-96 w-64 overflow-hidden rounded-lg shadow-xl lg:-ml-8 lg:-mt-8 lg:mb-0">
                <Image
                  src={comic.coverUrl ?? '/placeholder.png'}
                  alt={comic.title}
                  width={256}
                  height={384}
                  className="size-full object-cover"
                />
              </div>
            </div>
            <div className="flex w-full flex-col justify-between p-6 lg:w-2/3">
              <div>
                <h1 className="mb-4 text-3xl font-bold">{comic.title}</h1>
                <p className="mb-4 text-lg">作者: {comic.author}</p>
                <p className="text-gray-700">{comic.description}</p>
              </div>
              <div className="mt-4 flex items-center">
                <BookOpen className="mr-2" />
                <span>{comic.chapters.length} 章节</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <h2 className="mb-4 mt-8 text-2xl font-semibold">章节列表</h2>
      {comic.chapters.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9">
          {comic.chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/comics/${comic.id}/chapters/${chapter.chapterNumber}`}
              className="block"
            >
              <Tooltip
                showArrow={true}
                closeDelay={2000}
                color="success"
                offset={-7}
                content={
                  <div className="text-small font-bold">
                    {chapter.title ?? undefined}
                  </div>
                }
              >
                <Button size="md" variant="bordered">
                  第{chapter.chapterNumber}话
                </Button>
              </Tooltip>
            </Link>
          ))}
        </div>
      ) : (
        <p>暂无章节</p>
      )}
      <section>
        <div>
          <h2 className="mt-4 text-xl font-bold">相关推荐</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
            {relatedComics.map((relatedComic) => (
              <ComicCard key={relatedComic.id} comic={relatedComic} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
