import { Image } from '@nextui-org/react'
import Link from 'next/link'
import { api } from '~/trpc/server'

const Banner = async () => {
  // 使用 tRPC 钩子获取广告数据
  const advertisements = await api.advertisement.getBanners()

  // 过滤并排序广告
  const banners =
    advertisements
      ?.filter(
        (ad) =>
          ad.type === 'BANNER' &&
          new Date() >= new Date(ad.startDate) &&
          new Date() <= new Date(ad.endDate),
      )
      .sort((a, b) => a.order - b.order) || []

  return (
    <div className="mx-auto w-full p-2">
      {banners.map((banner) => (
        <Link
          key={banner.id}
          href={banner.linkUrl}
          className="mb-4 block last:mb-0"
        >
          <Image
            src={banner.imagePath}
            alt={banner.title}
            width="100%"
            height={80}
            className="rounded-lg shadow-md"
          />
        </Link>
      ))}
    </div>
  )
}

export default Banner
