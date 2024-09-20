import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Image,
} from '@nextui-org/react'
import { type Novel } from '@prisma/client'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface NovelCardProps {
  novel: Novel
}

const NovelCard: React.FC<NovelCardProps> = ({ novel }) => {
  return (
    <Card isPressable isHoverable className="max-w-[200px]">
      {' '}
      {/* 调整最大宽度 */}
      <Link href={`/novels/${novel.id}`}>
        <CardHeader className="aspect-square p-0">
          <Image
            src={novel.coverUrl ?? '/placeholder-novel.jpg'}
            alt={novel.title}
            radius="lg"
            classNames={{
              wrapper: 'w-full h-full',
              img: 'object-cover w-full h-full',
            }}
          />
        </CardHeader>
        <CardBody className="p-2">
          <h4 className="line-clamp-1 text-small font-bold">{novel.title}</h4>
          <p className="line-clamp-1 text-tiny text-default-500">
            {novel.author}
          </p>
        </CardBody>
        <CardFooter className="p-2 pt-0">
          <p className="line-clamp-2 text-tiny text-default-400">
            {novel.description}
          </p>
          <BookOpen size={20} className="text-default-500" />
        </CardFooter>
      </Link>
    </Card>
  )
}

export default NovelCard
