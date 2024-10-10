import { Divider } from '@nextui-org/react'
import { type Video } from '@prisma/client'
import { type Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import VideoCard from '~/app/_components/Card/VideoCard'
import PaginationWrapper from '~/app/_components/Pagination'
import { api } from '~/trpc/server'

const SITE_NAME = '淫妹社'

type Props = {
  params: { id: string }
  searchParams: { page?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryId = parseInt(params.id)
  const [category, videosData] = await Promise.all([
    api.category.getById({ id: categoryId }),
    api.video.getAll({ categoryId, page: 1, perPage: 1 }),
  ])

  const title = `${category.name} - ${SITE_NAME}`
  const description = `探索${category.name}分类下的精彩视频。当前有${videosData.totalCount}个视频等待您的观看。`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {videos.map((video) => (
        <Link key={video.id} href={`/voddetail/${video.id}`}>
          <VideoCard video={video} />
        </Link>
      ))}
    </div>
  )
}

export default async function VideoCategoryPage({
  params,
  searchParams,
}: Props) {
  const categoryId = parseInt(params.id)
  const page = parseInt(searchParams.page ?? '1')
  const perPage = 20

  const [category, videosData] = await Promise.all([
    api.category.getById({ id: categoryId }),
    api.video.getAll({ categoryId, page, perPage }),
  ])

  return (
    <div className="container mx-auto px-1 py-2">
      <h1 className="mb-6 text-3xl font-bold">{category.name}</h1>

      <Suspense fallback={<div>正在加载视频...</div>}>
        <VideoGrid videos={videosData.videos} />
      </Suspense>

      {videosData.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <PaginationWrapper totalPages={videosData.totalPages} />
        </div>
      )}

      <Divider className="my-8" />

      <p className="text-center text-gray-600">
        总共 {videosData.totalCount} 个视频
      </p>
    </div>
  )
}
