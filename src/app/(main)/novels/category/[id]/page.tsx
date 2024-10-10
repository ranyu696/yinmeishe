import { type Metadata } from 'next'
import Link from 'next/link'
import NovelCard from '~/app/_components/Card/NovelCard'
import PaginationWrapper from '~/app/_components/Pagination'
import { api } from '~/trpc/server'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryId = parseInt(params.id)
  const category = await api.category.getById({ id: categoryId })
  const siteName =
    ((await api.systemSettings.getOne({
      category: 'basic',
      key: 'siteName',
    })) as string) || '小新小说'
  const novelsData = await api.novel.getAll({
    categoryId,
    page: 1,
    perPage: 1,
  })

  if (!category) {
    return {
      title: `分类未找到 - ${siteName}`,
      description: '抱歉，我们找不到您请求的小说分类。',
    }
  }

  const title = `${category.name} 小说 - ${siteName}`
  const description = `浏览 ${category.name} 分类下的精彩小说。当前有 ${novelsData.totalCount} 本小说等待您的探索。`

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

export default async function NovelCategoryPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { page?: string }
}) {
  const categoryId = parseInt(params.id)
  const page = parseInt(searchParams.page ?? '1')
  const perPage = 24

  const [categoryData, novelsData] = await Promise.all([
    api.category.getById({ id: categoryId }),
    api.novel.getAll({ categoryId, page, perPage }),
  ])

  if (!categoryData) {
    return <div className="mt-10 text-center text-2xl">分类不存在</div>
  }

  return (
    <div className="m-2 mx-auto">
      <h1 className="mb-4 text-2xl font-bold sm:text-3xl">
        {categoryData.name}
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {novelsData.novels.map((novel) => (
          <Link key={novel.id} href={`/novels/${novel.id}`}>
            <NovelCard key={novel.id} novel={novel} />
          </Link>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <PaginationWrapper totalPages={novelsData.totalPages} />
      </div>
    </div>
  )
}
