'use client'

import { Button, Card } from '@nextui-org/react'
import { type PictureImage } from '@prisma/client'
import { ZoomIn } from 'lucide-react'
import Image from 'next/image'
import { Suspense } from 'react'
import Masonry from 'react-masonry-css'

interface MasonryGalleryProps {
  images: PictureImage[]
  title: string
}

export default function MasonryGallery({ images, title }: MasonryGalleryProps) {
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  }

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {images.map((image, index) => (
        <Suspense
          key={image.id}
          fallback={
            <div
              className="w-full animate-pulse bg-gray-200"
              style={{ height: '200px' }}
            ></div>
          }
        >
          <Card className="group overflow-hidden transition-shadow duration-300 hover:shadow-lg">
            <div className="relative">
              <Image
                src={image.path}
                alt={`${title} - Image ${index + 1}`}
                width={image.width}
                height={image.height}
                className="h-auto w-full transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="bg-opacity-0/0 group-hover:bg-opacity-30/30 absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Button
                  isIconOnly
                  color="primary"
                  variant="ghost"
                  className="mx-1"
                >
                  <ZoomIn size={24} />
                </Button>
              </div>
            </div>
          </Card>
        </Suspense>
      ))}
    </Masonry>
  )
}
