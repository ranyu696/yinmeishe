import CategoryList from '~/app/components/category/CategoryList'
import { api } from '~/trpc/server'

export default async function CategoriesPage() {
  const categories = await api.category.getAll()

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">分类管理</h1>
      <CategoryList initialCategories={categories} />
    </div>
  )
}
