import { Card, CardBody, CardHeader, Image } from '@nextui-org/react'
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
    <Card isPressable>
      <CardHeader className="aspect-video p-0">
        <Image
          src={video.coverUrl ?? '/https://via.placeholder.com/300x200'}
          alt={video.title}
          width={320}
          radius="lg"
          isZoomed
          className="h-auto object-cover"
        />
      </CardHeader>
      <CardBody className="py-1">
        <h4 className="line-clamp-2  text-xs font-normal md:text-sm md:font-bold">
          {video.title}
        </h4>
      </CardBody>
    </Card>
  )
}

export default VideoCard
