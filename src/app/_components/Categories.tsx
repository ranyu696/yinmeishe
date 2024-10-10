'use client'
import { Button } from '@nextui-org/react'
import { type Category } from '@prisma/client'
import React from 'react'

interface CategoriesProps {
  categories: Category[]
}

const Categories: React.FC<CategoriesProps> = ({ categories }) => {
  const groupedCategories = groupCategoriesByParent(categories)

  return (
    <div className="w-full px-1 py-2">
      {Object.entries(groupedCategories).map(([parentId, group]) => (
        <CategoryGroup key={parentId} group={group} />
      ))}
    </div>
  )
}

interface CategoryGroupProps {
  group: Category[]
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({ group }) => {
  const parentCategory = group.find((category) => category.parentId === null)
  const childCategories = group.filter((category) => category.parentId !== null)

  if (!parentCategory) return null

  return (
    <div className="mt-2 grid grid-cols-5 gap-2 md:grid-cols-9">
      <CategoryItem
        category={parentCategory}
        isParent={true}
        className="col-span-1 row-span-2 md:col-span-1"
      />
      {childCategories.map((category) => (
        <CategoryItem key={category.id} category={category} isParent={false} />
      ))}
    </div>
  )
}

interface CategoryItemProps {
  category: Category
  isParent: boolean
  className?: string
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  isParent,
  className,
}) => {
  const href = category.url ?? `/vodtype/${category.id}`

  return (
    <Button
      as="a"
      href={href}
      className={`
        ${isParent ? 'text-lg font-bold' : 'text-sm'}
        ${className ?? ''}
      `.trim()}
      color="primary"
      variant="flat"
      size="sm"
    >
      {category.name}
    </Button>
  )
}

function groupCategoriesByParent(
  categories: Category[],
): Record<number, Category[]> {
  return categories.reduce<Record<number, Category[]>>((acc, category) => {
    const key = category.parentId ?? category.id
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key] =
      category.parentId === null
        ? [category, ...acc[key]]
        : [...acc[key], category]
    return acc
  }, {})
}

export default Categories
