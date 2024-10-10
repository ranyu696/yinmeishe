import { Button, Divider, Image } from '@nextui-org/react'
import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import VideoCard from '~/app/_components/Card/VideoCard'
import { api } from '~/trpc/server'

const SITE_NAME = '淫美社'

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

  const title = `${video.title} - ${SITE_NAME}`
  const description =
    video.description ?? `观看 ${video.title} 和更多精彩视频内容。`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.other',
      videos: video.videoSources[0]?.playUrl
        ? [video.videoSources[0].playUrl]
        : undefined,
      images: video.coverUrl ? [video.coverUrl] : undefined,
    },
  }
}

export default async function VideoDetailPage({
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
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className="mb-4 text-3xl font-bold">{video.title}</h1>
          <Image
            src={video.coverUrl ?? '/placeholder-image.jpg'}
            alt={video.title}
            className="mb-4 w-full rounded-lg shadow-lg"
          />
          <p className="mb-4 text-gray-600">{video.description}</p>
          <Link href={`/vodplay/${videoId}`}>
            <Button color="primary" size="lg" className="w-full">
              播放视频
            </Button>
          </Link>
        </div>
      </div>

      <Divider className="my-8" />

      <section>
        <h2 className="mb-4 text-2xl font-bold">相关推荐</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {relatedVideos.map((relatedVideo) => (
            <Link key={relatedVideo.id} href={`/voddetail/${relatedVideo.id}`}>
              <VideoCard video={relatedVideo} />
            </Link>
          ))}
        </div>
      </section>

      <Divider className="my-8" />

      <section>
        <h2 className="mb-4 text-2xl font-bold">精选推荐</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featuredVideos.map((featuredVideo) => (
            <Link
              key={featuredVideo.id}
              href={`/voddetail/${featuredVideo.id}`}
            >
              <VideoCard video={featuredVideo} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
