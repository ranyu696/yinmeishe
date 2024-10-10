import Link from 'next/link'
import { api } from '~/trpc/server'

const BottomTags = async () => {
  const tags = await api.tag.getBottomTags()

  return (
    <div className="mt-2 w-full">
      <h2 className="mb-2 text-sm font-bold">底部标签</h2>
      <div className="lg:grid-cols-16 grid grid-cols-8 gap-1 p-0.5 sm:grid-cols-8 md:grid-cols-12">
        {tags.map((tag) => (
          <Link
            href={tag.url ?? `/search?q=${encodeURIComponent(tag.name)}`}
            key={tag.id}
            className="min-w-0"
          >
<div className="cursor-pointer truncate rounded-lg bg-[#2f2f2f] px-2 py-1 text-center text-xs text-[#fff7bd] transition-colors hover:bg-[#3f3f3f] sm:text-sm">
  {tag.name}
</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default BottomTags
