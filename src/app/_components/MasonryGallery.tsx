'use client'

import { Button, Card, CircularProgress } from '@nextui-org/react'
import { type PictureImage } from '@prisma/client'
import { ZoomIn } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import Masonry from 'react-masonry-css'
import { useMediaQuery } from 'react-responsive'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

interface MasonryGalleryProps {
  images: PictureImage[]
  title: string
}

interface ImageCardProps {
  image: PictureImage
  title: string
  index: number
  isLoaded: boolean
  onLoad: (index: number) => void
  onZoom: () => void
}

const ImageCard: React.FC<ImageCardProps> = React.memo(
  ({ image, title, index, isLoaded, onLoad, onZoom }) => {
    return (
      <Card className="group overflow-hidden transition-shadow duration-300 hover:shadow-lg">
        <div className="relative">
          <Image
            src={image.path}
            alt={`${title} - Image ${index + 1}`}
            width={image.width}
            height={image.height}
            className={`h-auto w-full transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => onLoad(index)}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
          />
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <CircularProgress
                size="sm"
                color="primary"
                aria-label="Loading..."
              />
            </div>
          )}
          <div className="bg-opacity-0/0 group-hover:bg-opacity-30/30 absolute inset-0 flex items-center justify-center bg-gray-200/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              isIconOnly
              color="primary"
              variant="ghost"
              className="mx-1"
              onClick={onZoom}
            >
              <ZoomIn size={24} />
            </Button>
          </div>
        </div>
      </Card>
    )
  },
)

ImageCard.displayName = 'ImageCard'

const MasonryGallery: React.FC<MasonryGalleryProps> = React.memo(
  ({ images, title }) => {
    const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>(
      {},
    )
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState(0)
    const [columns, setColumns] = useState(4)
    const [isMounted, setIsMounted] = useState(false)

    const useMediaQueryTyped = useMediaQuery as (query: string | object) => boolean;

    const isDesktop = useMediaQueryTyped({ minWidth: 1200 });
    const isTablet = useMediaQueryTyped({ minWidth: 900, maxWidth: 1199 });
    const isMobile = useMediaQueryTyped({ minWidth: 600, maxWidth: 899 });

    useEffect(() => {
      setIsMounted(true)
    }, [])

    useEffect(() => {
      if (isMounted) {
        setColumns(isDesktop ? 4 : isTablet ? 3 : isMobile ? 2 : 1)
      }
    }, [isDesktop, isTablet, isMobile, isMounted])

    const sortedImages = [...images].sort((a, b) => b.height - a.height)

    const handleImageLoad = useCallback((index: number) => {
      setImagesLoaded((prev) => ({ ...prev, [index]: true }))
    }, [])

    const handleZoom = useCallback((index: number) => {
      setLightboxIndex(index)
      setLightboxOpen(true)
    }, [])

    if (!isMounted) {
      return null // 或者返回一个加载指示器
    }

    return (
      <>
        <Masonry
          breakpointCols={columns}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {sortedImages.map((image, index) => (
            <ImageCard
              key={image.id}
              image={image}
              title={title}
              index={index}
              isLoaded={imagesLoaded[index] ?? false}
              onLoad={handleImageLoad}
              onZoom={() => handleZoom(index)}
            />
          ))}
        </Masonry>
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={sortedImages.map((img) => ({ src: img.path }))}
        />
      </>
    )
  },
)

MasonryGallery.displayName = 'MasonryGallery'

export default MasonryGallery
