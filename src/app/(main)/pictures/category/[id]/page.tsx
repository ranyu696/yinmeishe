import { Card, CardBody, CardFooter } from '@nextui-org/react'
import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
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
    })) as string) || '小新图片'
  const picturesData = await api.picture.getAll({
    categoryId,
    page: 1,
    perPage: 1,
  })

  if (!category) {
    return {
      title: `分类未找到 - ${siteName}`,
      description: '抱歉，我们找不到您请求的图片分类。',
    }
  }

  const title = `${category.name} 图片 - ${siteName}`
  const description = `浏览 ${category.name} 分类下的精彩图片。当前有 ${picturesData.total} 张图片等待您的探索。`

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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { page?: string }
}) {
  const categoryId = parseInt(params.id)
  const page = parseInt(searchParams.page ?? '1')
  const perPage = 20

  const [categoryData, picturesData] = await Promise.all([
    api.category.getById({ id: categoryId }),
    api.picture.getAll({ categoryId, page, perPage }),
  ])

  if (!categoryData) {
    return <div className="mt-10 text-center text-2xl">分类不存在</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{categoryData.name}</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {picturesData.pictures.map((picture) => (
          <Link
            key={picture.id}
            href={`/pictures/${picture.id}`}
            passHref
            legacyBehavior
          >
            <Card
              as="a"
              className="transition-shadow duration-300 hover:shadow-lg"
            >
              <CardBody className="p-0">
                <Image
                  src={picture.coverUrl ?? '/placeholder-image.jpg'}
                  alt={picture.title}
                  width={300}
                  height={200}
                  className="h-48 w-full object-cover"
                />
              </CardBody>
              <CardFooter className="justify-between text-small">
                <b>{picture.title}</b>
                <p className="text-default-500">
                  {picture.images.length} 张图片
                </p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <PaginationWrapper totalPages={picturesData.pages} />
      </div>
    </div>
  )
}
