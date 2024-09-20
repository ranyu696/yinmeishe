import { Button, Card, CardBody, CardFooter } from '@nextui-org/react'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '~/trpc/server'

export default async function PicturesHomePage() {
  const categories = await api.category.getByType({ type: 'Picture' })

  const categoryPictures = await Promise.all(
    categories.map(async (category) => {
      const picturesData = await api.picture.getAll({
        categoryId: category.id,
        page: 1,
        perPage: 4,
      })
      return {
        ...category,
        pictures: picturesData.pictures,
      }
    }),
  )

  return (
    <div className="m-2 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">图集首页</h1>
      {categoryPictures.map((category) => (
        <div key={category.id} className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{category.name}</h2>
            <Link href={`/pictures/category/${category.id}`} passHref>
              <Button
                as="a"
                color="primary"
                variant="ghost"
                endContent={<ChevronRight size={16} />}
              >
                更多
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {category.pictures.map((picture) => (
              <Link key={picture.id} href={`/pictures/${picture.id}`} passHref>
                <Card className="transition-shadow duration-300 hover:shadow-lg">
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
        </div>
      ))}
    </div>
  )
}
