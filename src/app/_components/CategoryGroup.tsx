// components/CategoryGroup.tsx
import { Button } from '@nextui-org/react'
import Link from 'next/link'
import { CategoryType } from '~/types'

const getTypeUrl = (type: CategoryType): string => {
  switch (type) {
    case CategoryType.Video:
      return 'videos'
    case CategoryType.Novel:
      return 'novels'
    case CategoryType.Picture:
      return 'pictures'
    case CategoryType.Comic:
      return 'comics'
    default:
      return type
  }
}

export const CategoryGroup = ({
  type,
  categories,
}: {
  type: CategoryType
  categories: { id: number; name: string }[]
}) => {
  return (
    <div className="mb-2">
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/${getTypeUrl(type)}/category/${category.id}`}
          >
            <Button
              size="sm"
              color="danger"
              variant="shadow"
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
