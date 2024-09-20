import { Button } from '@nextui-org/react'
import Link from 'next/link'
import { api } from '~/trpc/server'
import { CategoryType } from '~/types'

const CategoryGroup = ({
  type,
  categories,
}: {
  type: CategoryType
  categories: { id: number; name: string }[]
}) => {
  const getTypeTitle = (type: CategoryType) => {
    switch (type) {
      case CategoryType.Video:
        return '视频'
      case CategoryType.Novel:
        return '小说'
      case CategoryType.Picture:
        return '图片'
      case CategoryType.Comic:
        return '漫画'
      default:
        return type
    }
  }

  return (
    <div className="mb-2">
      <h2 className="mb-2 text-2xl font-bold">{getTypeTitle(type)}</h2>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {categories.map((category) => (
          <Link key={category.id} href={`/${type}/category/${category.id}`}>
            <Button
              key={category.id}
              size="md"
              color="primary"
              variant="bordered"
              className="w-full"
            >
              {category.name}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}

const Category = async () => {
  const videoCategories = await api.category.getByType({
    type: CategoryType.Video,
  })
  const novelCategories = await api.category.getByType({
    type: CategoryType.Novel,
  })
  const imageCategories = await api.category.getByType({
    type: CategoryType.Picture,
  })

  return (
    <div className="mx-auto w-full pt-2">
      <CategoryGroup type={CategoryType.Video} categories={videoCategories} />
      <CategoryGroup type={CategoryType.Novel} categories={novelCategories} />
      <CategoryGroup type={CategoryType.Picture} categories={imageCategories} />
    </div>
  )
}

export default Category
