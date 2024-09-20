// app/videos/category/[id]/page.tsx
import { type Video } from '@prisma/client'
import { type Metadata } from 'next'
import VideoCard from '~/app/_components/Card/VideoCard'
import PaginationWrapper from '~/app/_components/Pagination'
import { api } from '~/trpc/server'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryId = parseInt(params.id)
  const category = await api.category.getById({ id: categoryId })
  const videosData = await api.video.getAll({ categoryId, page: 1, perPage: 1 })

  // 获取网站名称
  const siteName =
    ((await api.systemSettings.getOne({
      category: 'general',
      key: 'siteName',
    })) as string) || '小新视频'

  const title = `${category.name} - ${siteName}`
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
export default async function VideoCategoryPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { page?: string }
}) {
  const categoryId = parseInt(params.id)
  const page = parseInt(searchParams.page ?? '1')
  const perPage = 20

  const [categoryData, videosData] = await Promise.all([
    api.category.getById({ id: categoryId }),
    api.video.getAll({ categoryId, page, perPage }),
  ])

  return (
    <div className="container mx-auto">
      <h1 className="mb-8 text-4xl font-bold">{categoryData?.name} 视频</h1>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {videosData.videos.map((video: Video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {videosData.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <PaginationWrapper totalPages={videosData.totalPages} />
        </div>
      )}

      <p className="mt-4 text-center text-gray-600">
        总共 {videosData.totalCount} 个视频
      </p>
    </div>
  )
}
