import { CategoryType } from '@prisma/client'
import { api } from '~/trpc/server'
import Categories from './Categories'

export default async function CategorPage() {
  const videoCategories = await api.category.getByType({
    type: CategoryType.Video,
  })

  return <Categories categories={videoCategories} />
}
