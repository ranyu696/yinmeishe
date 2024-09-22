import { Button } from '@nextui-org/react'
import {
  type Comic,
  type Novel,
  type Picture,
  type Video,
} from '@prisma/client'
import { type Metadata } from 'next'
import Link from 'next/link'
import { api } from '~/trpc/server'
import ComicCard from '../_components/Card/ComicCard'
import NovelCard from '../_components/Card/NovelCard'
import { PictureCard } from '../_components/Card/PictureCard'
import VideoCard from '../_components/Card/VideoCard'

export async function generateMetadata(): Promise<Metadata> {
  // 获取 SEO 设置
  const title = await api.systemSettings.getOne({
    category: 'seo',
    key: 'homeTitle',
  })
  const description = await api.systemSettings.getOne({
    category: 'seo',
    key: 'homeDescription',
  })
  const keywords = await api.systemSettings.getOne({
    category: 'seo',
    key: 'homeKeywords',
  })

  return {
    title: (title as string) || '小新视频 - 您的在线娱乐平台',
    description:
      (description as string) || '小新视频提供高质量的视频、小说和漫画内容',
    keywords: (keywords as string) || '视频,小说,漫画,娱乐',
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
  const latestImages = await api.picture.getAll({ page: 1, perPage: 4 })
  const latestNovels = await api.novel.getAll({ page: 1, perPage: 4 })
  const latestComics = await api.comic.getAll({ page: 1, perPage: 4 })

  return (
    <>
      <h1 className="mb-2 text-center text-4xl font-bold">欢迎来到内容中心</h1>
      <section className="mb-4">
        <h2 className="mb-4 text-2xl font-semibold">最新视频</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4">
          {latestVideos.videos.map((video: Video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/videos">
            <Button color="primary">查看更多视频</Button>
          </Link>
        </div>
      </section>
      <section className="mb-4">
        <h2 className="mb-4 text-2xl font-semibold">国产精品视频</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4">
          {category1Videos.videos.map((video: Video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/videos/category/1">
            <Button color="primary">查看更多国产精品视频</Button>
          </Link>
        </div>
      </section>
      <section className="mb-4">
        <h2 className="mb-4 text-2xl font-semibold">反差骚货视频</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4">
          {category4Videos.videos.map((video: Video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/videos/category/4">
            <Button color="primary">查看更多反差骚货视频</Button>
          </Link>
        </div>
      </section>
      <section className="mb-4">
        <h2 className="mb-4 text-2xl font-semibold">白虎萝莉视频</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4">
          {category5Videos.videos.map((video: Video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/videos/category/5">
            <Button color="primary">查看更多白虎萝莉视频</Button>
          </Link>
        </div>
      </section>
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">最新图片</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {latestImages.pictures.map((picture: Picture) => (
            <PictureCard key={picture.id} picture={picture} />
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/images">
            <Button color="secondary">浏览更多图片</Button>
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">热门小说</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {latestNovels.novels.map((novel: Novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/novels">
            <Button color="success">发现更多小说</Button>
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">精选漫画</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {latestComics.comics.map((comic: Comic) => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/comics">
            <Button color="warning">阅读更多漫画</Button>
          </Link>
        </div>
      </section>
    </>
  )
}
