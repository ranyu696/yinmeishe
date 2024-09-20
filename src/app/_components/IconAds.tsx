import { Avatar, Card } from '@nextui-org/react'
import Link from 'next/link'
import { api } from '~/trpc/server'

const IconAds = async () => {
  // 使用 tRPC 获取广告数据
  const advertisements = await api.advertisement.getIcons()

  // 过滤并排序广告
  const icons =
    advertisements
      ?.filter(
        (ad) =>
          ad.type === 'ICON' &&
          new Date() >= new Date(ad.startDate) &&
          new Date() <= new Date(ad.endDate),
      )
      .sort((a, b) => a.order - b.order) || []

  return (
    <div className="mx-auto w-full px-2">
      <Card className="p-2">
        <div className="grid grid-cols-5 gap-2 md:grid-cols-8 lg:grid-cols-10">
          {icons.map((icon) => (
            <Link href={icon.linkUrl} key={icon.id} passHref>
              <div className="flex flex-col items-center">
                <Avatar
                  src={icon.imagePath}
                  alt={icon.title}
                  className="mb-1 size-16"
                />
                <span className="text-center text-sm">{icon.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default IconAds
