import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Image,
  Link,
} from '@nextui-org/react'
import { type Picture } from '@prisma/client'
import React from 'react'

interface PictureCardProps {
  picture: Picture
}
export const PictureCard: React.FC<PictureCardProps> = ({ picture }) => {
  return (
    <Card isPressable className="max-w-[240px]">
      <Link href={`/pictures/${picture.id}`}>
        <CardHeader className="p-0">
          <Image
            src={picture.coverUrl ?? '/placeholder-image.jpg'}
            alt={picture.title}
            width="240"
            height="336"
            radius="lg"
            classNames={{
              img: 'object-cover w-full h-[336px]',
            }}
          />
        </CardHeader>
        <CardBody className="px-3 py-2">
          <h4 className="line-clamp-1 text-small font-bold">{picture.title}</h4>
        </CardBody>
        <CardFooter className="px-3 py-2">
          <p className="line-clamp-2 text-tiny text-default-400">
            {picture.description ?? '暂无描述'}
          </p>
        </CardFooter>
      </Link>
    </Card>
  )
}
