import { Card, CardBody, CardHeader, Image } from '@nextui-org/react'
import { Play } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface VideoCardProps {
  video: {
    id: number
    title: string
    coverUrl: string | null
    description: string | null
  }
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  return (
    <Card isPressable className="max-w-[300px]">
      {' '}
      {/* 调整最大宽度 */}
      <Link href={`/videos/${video.id}`}>
        <CardHeader className="relative aspect-video p-0">
          <Image
            src={video.coverUrl ?? '/placeholder-video.jpg'}
            alt={video.title}
            radius="lg"
            classNames={{
              wrapper: 'w-full h-full',
              img: 'object-cover w-full h-full',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Play size={48} className="text-white opacity-80" />
          </div>
        </CardHeader>
        <CardBody className="py-2">
          <h4 className="line-clamp-2 text-small font-bold">{video.title}</h4>
        </CardBody>
      </Link>
    </Card>
  )
}

export default VideoCard
