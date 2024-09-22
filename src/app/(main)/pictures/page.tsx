import { Button} from '@nextui-org/react'
import { type Picture } from '@prisma/client'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { PictureCard } from '~/app/_components/Card/PictureCard'
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

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5">
            {category.pictures.map((picture:Picture) => (
              <Link key={picture.id} href={`/pictures/${picture.id}`} >
                 <PictureCard key={picture.id} picture={picture} />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
