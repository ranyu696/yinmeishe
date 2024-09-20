import { Chip } from '@nextui-org/react'
import Link from 'next/link'
import { api } from '~/trpc/server'

const BottomTags = async () => {
  const tags = await api.tag.getBottomTags()

  return (
    <div className="mx-auto w-full pt-2">
      <div className="flex flex-wrap justify-center gap-2">
        {tags.map((tag) => (
          <Link href={tag.url ?? '#'} key={tag.id}>
            <Chip variant="dot" color="secondary" className="cursor-pointer">
              {tag.name}
            </Chip>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default BottomTags
