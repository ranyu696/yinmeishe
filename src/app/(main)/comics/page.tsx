import { Button } from '@nextui-org/react'
import { ChevronRight } from 'lucide-react'
import { type Metadata } from 'next'
import Link from 'next/link'
import ComicCard from '~/app/_components/Card/ComicCard'
import { api } from '~/trpc/server'

export async function generateMetadata(): Promise<Metadata> {
  const siteName =
    ((await api.systemSettings.getOne({
      category: 'basic',
      key: 'siteName',
    })) as string) ?? '小新漫画'
  const totalComicsData = await api.comic.getAll({})
  const categories = await api.category.getByType({ type: 'Comic' })

  const title = `漫画库 - ${siteName}`
  const description = `探索我们的漫画库，包含 ${totalComicsData.total} 本精选漫画，涵盖 ${categories.length} 个分类。在 ${siteName} 开启您的漫画阅读之旅。`

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

export default async function ComicsHomePage() {
  const categories = await api.category.getByType({ type: 'Comic' })

  const categoryComics = await Promise.all(
    categories.map(async (category) => {
      const comicsData = await api.comic.getAll({
        categoryId: category.id,
        page: 1,
        perPage: 24,
        isActive: true,
      })
      return {
        ...category,
        comics: comicsData.comics,
      }
    }),
  )

  return (
    <div className="m-2 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">漫画首页</h1>

      {categoryComics.map((category) => (
        <div key={category.id} className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{category.name}</h2>
            <Link href={`/comics/category/${category.id}`}>
              <Button
                color="primary"
                variant="ghost"
                endContent={<ChevronRight size={16} />}
              >
                更多
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {category.comics.map((comic) => (
              <Link key={comic.id} href={`/comics/${comic.id}`} passHref>
                <ComicCard key={comic.id} comic={comic} />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
