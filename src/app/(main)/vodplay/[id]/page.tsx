import { Divider } from '@nextui-org/react'
import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import VideoCard from '~/app/_components/Card/VideoCard'
import VideoPlayer from '~/app/_components/VideoPlayer'
import { api } from '~/trpc/server'

const SITE_NAME = '淫妹社'

type Props = { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const videoId = parseInt(params.id)
  const video = await api.video.getById(videoId)

  if (!video) {
    return {
      title: `视频未找到 - ${SITE_NAME}`,
      description: '抱歉，我们找不到您请求的视频。',
    }
  }

  const title = `正在播放: ${video.title} - ${SITE_NAME}`
  const description = `正在 ${SITE_NAME} 上观看 ${video.title}。${video.description ?? ''}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.movie',
      videos: video.videoSources[0]?.playUrl
        ? [video.videoSources[0].playUrl]
        : undefined,
      images: video.coverUrl ? [video.coverUrl] : undefined,
    },
  }
}

export default async function VideoPlayPage({
  params,
}: {
  params: { id: string }
}) {
  const videoId = parseInt(params.id)
  const [video, relatedVideos, featuredVideos] = await Promise.all([
    api.video.getById(videoId),
    api.video.getRelatedVideos({ videoId, limit: 8 }),
    api.video.getFeaturedVideos({ limit: 8 }),
  ])
  if (!video) {
    notFound()
  }
  return (
    <div className="container mx-auto px-1 py-2">
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">{video.title}</h1>
      <div className="mb-4 aspect-video overflow-hidden rounded-lg shadow-lg">
        <VideoPlayer
          id={videoId}
          src={video.videoSources[0]?.playUrl ?? ''}
          poster={video.coverUrl ?? undefined}
        />
      </div>

      <p className="mb-6 text-sm text-gray-600 md:text-base">
        {video.description}
      </p>

      <Divider className="my-8" />

      <section>
        <h2 className="mb-4 text-xl font-bold">相关推荐</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {relatedVideos.map((relatedVideo) => (
            <Link key={relatedVideo.id} href={`/vodplay/${relatedVideo.id}`}>
              <VideoCard video={relatedVideo} />
            </Link>
          ))}
        </div>
      </section>

      <Divider className="my-8" />

      <section>
        <h2 className="mb-4 text-xl font-bold">精选推荐</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featuredVideos.map((featuredVideo) => (
            <Link key={featuredVideo.id} href={`/vodplay/${featuredVideo.id}`}>
              <VideoCard video={featuredVideo} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
