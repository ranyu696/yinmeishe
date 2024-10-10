import { Button } from '@nextui-org/react'
import { type Comic, type ComicChapter, type ComicImage } from '@prisma/client'
import { ChevronLeft, ChevronRight, Home } from 'lucide-react'
import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { api } from '~/trpc/server'

type ChapterWithImages = ComicChapter & {
  images: ComicImage[]
}

type ComicWithChapters = Comic & {
  chapters: ComicChapter[]
}

type Props = {
  params: { comicId: string; chapterNumber: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const comicId = parseInt(params.comicId)
  const chapterNumber = parseInt(params.chapterNumber)
  const comic = await api.comic.getById(comicId)
  const chapter = await api.comic.getByNumber({ comicId, chapterNumber })
  const siteName =
    ((await api.systemSettings.getOne({
      category: 'basic',
      key: 'siteName',
    })) as string) || '小新漫画'

  if (!comic || !chapter) {
    return {
      title: `章节未找到 - ${siteName}`,
      description: '抱歉，我们找不到您请求的漫画章节。',
    }
  }

  const title = `${chapter.title ?? `第 ${chapter.chapterNumber} 章`} - ${comic.title} - ${siteName}`
  const description = `阅读 ${comic.title} 的第 ${chapter.chapterNumber} 章${chapter.title ? `：${chapter.title}` : ''}。由 ${comic.author} 创作的精彩漫画。`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'book',
      images: comic.coverUrl
        ? [comic.coverUrl]
        : comic.coverUrl
          ? [comic.coverUrl]
          : [],
    },
  }
}

export default async function ChapterPage({
  params,
}: {
  params: { comicId: string; chapterNumber: string }
}) {
  const comicId = parseInt(params.comicId)
  const chapterNumber = parseInt(params.chapterNumber)

  const comic = (await api.comic.getById(comicId)) as ComicWithChapters
  const currentChapter = (await api.comic.getByNumber({
    comicId,
    chapterNumber,
  })) as ChapterWithImages

  if (!comic || !currentChapter) return notFound()

  const chaptersList = comic.chapters
  const prevChapter = chaptersList.find(
    (ch) => ch.chapterNumber === chapterNumber - 1,
  )
  const nextChapter = chaptersList.find(
    (ch) => ch.chapterNumber === chapterNumber + 1,
  )

  return (
    <div className="m-2 mx-auto">
      <nav className="sticky top-0 z-10 mb-8 flex items-center justify-between bg-background shadow-md">
        <Link href={`/comics/${comicId}`}>
          <Button color="primary" variant="ghost" startContent={<Home />}>
            返回详情
          </Button>
        </Link>
        <h1 className="max-w-[50%] truncate text-2xl font-bold">
          {comic.title} - 第 {chapterNumber} 话
        </h1>
        <div className="flex space-x-2">
          {prevChapter && (
            <Link
              href={`/comics/${comicId}/chapters/${prevChapter.chapterNumber}`}
            >
              <Button
                color="primary"
                variant="ghost"
                startContent={<ChevronLeft />}
              >
                上一话
              </Button>
            </Link>
          )}
          {nextChapter && (
            <Link
              href={`/comics/${comicId}/chapters/${nextChapter.chapterNumber}`}
            >
              <Button
                color="primary"
                variant="ghost"
                endContent={<ChevronRight />}
              >
                下一话
              </Button>
            </Link>
          )}
        </div>
      </nav>

      <div className="flex flex-col items-center">
        {currentChapter.images.map((image, index) => (
          <div key={index} className="w-full max-w-3xl">
            <Image
              src={image.path}
              alt={`Page ${index + 1}`}
              width={image.width}
              height={image.height}
              layout="responsive"
              className="shadow-lg"
            />
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 z-10 mt-8 flex justify-center space-x-4 bg-background p-4 shadow-md">
        {prevChapter && (
          <Link
            href={`/comics/${comicId}/chapters/${prevChapter.chapterNumber}`}
          >
            <Button
              color="primary"
              variant="ghost"
              startContent={<ChevronLeft />}
            >
              上一话
            </Button>
          </Link>
        )}
        {nextChapter && (
          <Link
            href={`/comics/${comicId}/chapters/${nextChapter.chapterNumber}`}
          >
            <Button
              color="primary"
              variant="ghost"
              endContent={<ChevronRight />}
            >
              下一话
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
