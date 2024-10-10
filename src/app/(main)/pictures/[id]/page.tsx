// app/picture/[id]/page.tsx
import { Button } from '@nextui-org/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import MasonryGallery from '~/app/_components/MasonryGallery'
import { api } from '~/trpc/server'
import Loading from './loading'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [picture, siteName] = await Promise.all([
    api.picture.getById(parseInt(params.id)),
    api.systemSettings.getOne({
      category: 'basic',
      key: 'siteName',
    }) as Promise<string>,
  ])

  if (!picture) {
    return {
      title: `图片未找到 - ${siteName}`,
      description: '抱歉，我们找不到您请求的图片。',
    }
  }

  const title = `${picture.title} - ${siteName}`
  const description = `查看 ${picture.title} 和更多精彩图片内容。`
  const openGraphImages = picture.coverUrl ? [picture.coverUrl] : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: openGraphImages,
    },
  }
}

export default async function PictureSetPage({
  params,
}: {
  params: { id: string }
}) {
  const imageSet = await api.picture.getById(parseInt(params.id))

  if (!imageSet) return notFound()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{imageSet.title}</h1>

      {imageSet.description && (
        <p className="mb-8 text-gray-600">{imageSet.description}</p>
      )}

      <Suspense fallback={<Loading />}>
        <MasonryGallery images={imageSet.images} title={imageSet.title} />
      </Suspense>

      <div className="mt-10 flex items-center justify-between">
        <Button color="primary" variant="ghost" startContent={<ChevronLeft />}>
          上一个图片集
        </Button>
        <Button color="primary" variant="ghost" endContent={<ChevronRight />}>
          下一个图片集
        </Button>
      </div>
    </div>
  )
}
