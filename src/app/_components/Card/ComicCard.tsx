import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Image,
} from '@nextui-org/react'
import Link from 'next/link'
import React from 'react'

interface ComicCardProps {
  comic: {
    id: number
    title: string
    author: string | null
    coverUrl: string | null
    description: string | null
  }
}
const ComicCard: React.FC<ComicCardProps> = ({ comic }) => {
  return (
    <Card isPressable className="max-w-[240px]">
      {' '}
      {/* 设置卡片最大宽度为240px */}
      <Link href={`/comics/${comic.id}`}>
        <CardHeader className="p-0">
          <Image
            src={comic.coverUrl ?? '/placeholder-image.jpg'}
            alt={comic.title}
            width="240"
            height="336" // 高度为宽度的1.4倍，保持5:7的比例
            radius="lg"
            classNames={{
              img: 'object-cover w-full h-[336px]',
            }}
          />
        </CardHeader>
        <CardBody className="px-3 py-2">
          <h4 className="line-clamp-1 text-small font-bold">{comic.title}</h4>
          <p className="line-clamp-1 text-tiny text-default-500">
            {comic.author ?? '未知作者'}
          </p>
        </CardBody>
        <CardFooter className="px-3 py-2">
          <p className="line-clamp-2 text-tiny text-default-400">
            {comic.description ?? '暂无描述'}
          </p>
        </CardFooter>
      </Link>
    </Card>
  )
}

export default ComicCard
