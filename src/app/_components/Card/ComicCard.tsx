import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Image,
} from '@nextui-org/react'
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
      <CardHeader className="p-0">
        <Image
          src={comic.coverUrl ?? 'https://via.placeholder.com/240x336'}
          alt={comic.title}
          width="240"
          height="336" // 高度为宽度的1.4倍，保持5:7的比例
          fallbackSrc="https://via.placeholder.com/240x336"
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
    </Card>
  )
}

export default ComicCard
