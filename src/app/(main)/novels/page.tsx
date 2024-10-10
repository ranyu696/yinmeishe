import { Button } from '@nextui-org/react'
import { ChevronRight } from 'lucide-react'
import { type Metadata } from 'next'
import Link from 'next/link'
import NovelCard from '~/app/_components/Card/NovelCard'
import { api } from '~/trpc/server'

export async function generateMetadata(): Promise<Metadata> {
  const siteName =
    ((await api.systemSettings.getOne({
      category: 'basic',
      key: 'siteName',
    })) as string) ?? '小新小说'
  const totalNovelsData = await api.novel.getAll({})
  const categories = await api.category.getByType({ type: 'Novel' })

  const title = `小说库 - ${siteName}`
  const description = `探索我们的小说库，包含 ${totalNovelsData.totalCount} 本精选小说，涵盖 ${categories.length} 个分类。在 ${siteName} 开启您的阅读之旅。`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

export default async function NovelsHomePage() {
  const categories = await api.category.getByType({ type: 'Novel' })

  const categoryNovels = await Promise.all(
    categories.map(async (category) => {
      const novelsData = await api.novel.getAll({
        categoryId: category.id,
        page: 1,
        perPage: 12,
        isActive: true,
      })
      return {
        ...category,
        novels: novelsData.novels,
      }
    }),
  )

  return (
    <div className="m-2 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">小说首页</h1>

      {categoryNovels.map((category) => (
        <div key={category.id} className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{category.name}</h2>
            <Link href={`/novels/category/${category.id}`}>
              <Button
                color="primary"
                variant="ghost"
                endContent={<ChevronRight size={16} />}
              >
                更多
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6">
            {category.novels.map((novel) => (
              <Link key={novel.id} href={`/novels/${novel.id}`}>
                <NovelCard key={novel.id} novel={novel} />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
