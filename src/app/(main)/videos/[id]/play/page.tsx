import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import VideoCard from '~/app/_components/Card/VideoCard'
import VideoPlayer from '~/app/_components/VideoPlayer'
import { api } from '~/trpc/server'

type Props = { params: { id: string } }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const videoId = parseInt(params.id)
  const video = await api.video.getById(videoId)
  const siteName =
    ((await api.systemSettings.getOne({
      category: 'general',
      key: 'siteName',
    })) as string) ?? '小新视频'

  if (!video) {
    return {
      title: `视频未找到 - ${siteName}`,
      description: '抱歉，我们找不到您请求的视频。',
    }
  }

  const title = `正在播放: ${video.title} - ${siteName}`
  const description = `正在 ${siteName} 上观看 ${video.title}。${video.description ?? ''}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.movie',
      videos: [video.playUrl],
      images: [video.coverUrl],
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
    notFound() // 这会触发 Next.js 的 404 页面
  }
  return (
    <div className="container mx-auto p-2">
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">{video.title}</h1>
      <div className="mb-4 aspect-video">
        <VideoPlayer src={video.playUrl} poster={video.coverUrl ?? undefined} />
      </div>
      <p className="mb-6 text-sm md:text-base">{video.description}</p>

      <section>
        <div>
          <h2 className="mt-4 text-xl font-bold">相关推荐</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {relatedVideos.map((relatedVideo) => (
              <VideoCard key={relatedVideo.id} video={relatedVideo} />
            ))}
          </div>
        </div>
        <h2 className="mt-6 text-2xl font-bold">精选推荐</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {featuredVideos.map((featuredVideo) => (
            <VideoCard key={featuredVideo.id} video={featuredVideo} />
          ))}
        </div>
      </section>
    </div>
  )
}
