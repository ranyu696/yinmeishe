import { Button } from '@nextui-org/react'
import { type Video } from '@prisma/client'
import { type Metadata } from 'next'
import Link from 'next/link'
import { api } from '~/trpc/server'
import VideoCard from '../_components/Card/VideoCard'

export async function generateMetadata(): Promise<Metadata> {
  const categories = await api.category.getAll()
  const categoryNames = categories.map((category) => category.name).join(',')

  return {
    title: '淫妹社 - 您的在线娱乐平台',
    description: '淫妹社提供高质量的视频内容，涵盖多个分类，满足您的观影需求。',
    keywords: `淫妹社视频,在线视频,${categoryNames}`,
  }
}

export default async function Home() {
  const category1Videos = await api.video.getAll({
    categoryId: 1,
    page: 1,
    perPage: 4,
  })
  const category4Videos = await api.video.getAll({
    categoryId: 4,
    page: 1,
    perPage: 4,
  })
  const category5Videos = await api.video.getAll({
    categoryId: 5,
    page: 1,
    perPage: 4,
  })
  const latestVideos = await api.video.getAll({ page: 1, perPage: 4 })

  return (
    <>
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">最新视频</h2>
          <Link href="/videos">
            <Button color="primary" size="sm">
              查看更多视频
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4">
          {latestVideos.videos.map((video: Video) => (
            <Link key={video.id} href={`/voddetail/${video.id}`}>
              <VideoCard key={video.id} video={video} />
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">精品视频</h2>
          <Link href="/vodtype/1">
            <Button color="primary" size="sm">
              查看更多精品视频
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4">
          {category1Videos.videos.map((video: Video) => (
            <Link key={video.id} href={`/voddetail/${video.id}`}>
              <VideoCard key={video.id} video={video} />
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">反差视频</h2>
          <Link href="/vodtype/4">
            <Button color="primary" size="sm">
              查看更多反货视频
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4">
          {category4Videos.videos.map((video: Video) => (
            <Link key={video.id} href={`/voddetail/${video.id}`}>
              <VideoCard key={video.id} video={video} />
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">白视频</h2>
          <Link href="/vodtype/5">
            <Button color="primary" size="sm">
              查看更多白虎萝莉视频
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4">
          {category5Videos.videos.map((video: Video) => (
            <Link key={video.id} href={`/voddetail/${video.id}`}>
              <VideoCard key={video.id} video={video} />
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
