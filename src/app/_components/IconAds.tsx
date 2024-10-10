import { Avatar } from '@nextui-org/react'
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
    <div className="mx-auto ml-[10px] mt-[5px] w-full">
      <div className="rounded-[3px] p-1">
        <ul className="flex flex-wrap">
          {icons.map((icon) => (
            <li
              key={icon.id}
              className="w-[19%] list-none text-center sm:w-[calc(99%/20)]"
            >
              <Link href={icon.linkUrl}>
                <Avatar
                  src={icon.imagePath}
                  alt={icon.title}
                  className="mx-auto mb-1 block size-[50px] rounded-[12px]"
                />
                <span className="text-blak block overflow-hidden text-center text-xs transition-colors duration-200 hover:font-bold hover:text-[#FD4C5D] dark:text-gray-200 dark:hover:text-[#FF6B6B]">
                  {icon.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default IconAds
