import { type Metadata } from 'next'
import Link from 'next/link'
import ComicCard from '~/app/_components/Card/ComicCard'
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
      category: 'general',
      key: 'siteName',
    })) as string) || '小新漫画'
  const comicsData = await api.comic.getAll({
    categoryId,
    page: 1,
    perPage: 1,
  })

  if (!category) {
    return {
      title: `分类未找到 - ${siteName}`,
      description: '抱歉，我们找不到您请求的漫画分类。',
    }
  }

  const title = `${category.name} 漫画 - ${siteName}`
  const description = `浏览 ${category.name} 分类下的精彩漫画。当前有 ${comicsData.total} 部漫画等待您的探索。`

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

export default async function ComicCategoryPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { page?: string }
}) {
  const categoryId = parseInt(params.id)
  const page = parseInt(searchParams.page ?? '1')
  const perPage = 20

  const [categoryData, comicsData] = await Promise.all([
    api.category.getById({ id: categoryId }),
    api.comic.getAll({ categoryId, page, perPage }),
  ])

  if (!categoryData) {
    return <div className="mt-10 text-center text-2xl">分类不存在</div>
  }

  return (
    <div className="m-2 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">{categoryData.name}</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {comicsData.comics.map((comic) => (
          <Link key={comic.id} href={`/comics/${comic.id}`}>
            <ComicCard key={comic.id} comic={comic} />
          </Link>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <PaginationWrapper totalPages={comicsData.totalPages} />
      </div>
    </div>
  )
}
