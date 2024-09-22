import { Button } from '@nextui-org/react'
import { ChevronRight } from 'lucide-react'
import { type Metadata } from 'next'
import Link from 'next/link'
import VideoCard from '~/app/_components/Card/VideoCard'
import { api } from '~/trpc/server'

export async function generateMetadata(): Promise<Metadata> {
  // 获取视频首页的SEO设置
  const title = await api.systemSettings.getOne({
    category: 'seo',
    key: 'videoHomeTitle',
  })
  const description = await api.systemSettings.getOne({
    category: 'seo',
    key: 'videoHomeDescription',
  })
  const keywords = await api.systemSettings.getOne({
    category: 'seo',
    key: 'videoHomeKeywords',
  })
  const ogImageUrl = await api.systemSettings.getOne({
    category: 'seo',
    key: 'videoHomeOgImage',
  })

  // 获取视频分类数量，用于增强描述
  const categories = await api.category.getByType({ type: 'Video' })
  const categoryCount = categories.length

  return {
    title: (title as string) || '视频首页 - 小新视频',
    description:
      ((description as string) ||
        `探索我们的视频库，包含 ${categoryCount} 个精选分类。`) +
      ` 在小新视频，您可以找到各种类型的高质量视频内容。`,
    keywords: (keywords as string) || '视频,在线视频,视频分类,小新视频',
    openGraph: {
      title: (title as string) || '视频首页 - 小新视频',
      description:
        ((description as string) ||
          `探索我们的视频库，包含 ${categoryCount} 个精选分类。`) +
        ` 在小新视频，您可以找到各种类型的高质量视频内容。`,
      images: ogImageUrl ? [ogImageUrl as string] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: (title as string) || '视频首页 - 小新视频',
      description:
        ((description as string) ||
          `探索我们的视频库，包含 ${categoryCount} 个精选分类。`) +
        ` 在小新视频，您可以找到各种类型的高质量视频内容。`,
      images: ogImageUrl ? [ogImageUrl as string] : [],
    },
  }
}
export default async function VideosHomePage() {
  const categories = await api.category.getByType({ type: 'Video' })

  const categoryVideos = await Promise.all(
    categories.map(async (category) => {
      const videosData = await api.video.getAll({
        categoryId: category.id,
        page: 1,
        perPage: 4,
        isActive: true, // 只获取已上架（激活）的视频
      })
      return {
        ...category,
        videos: videosData.videos,
      }
    }),
  )

  return (
    <div className="m-2 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">视频首页</h1>

      {categoryVideos.map((category) => (
        <div key={category.id} className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{category.name}</h2>
            <Link href={`/videos/category/${category.id}`}>
              <Button
                as="a"
                color="primary"
                variant="ghost"
                endContent={<ChevronRight size={16} />}
              >
                更多
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
            {category.videos.map((video) => (
              <Link key={video.id} href={`/videos/${video.id}`}>
                <VideoCard key={video.id} video={video} />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
