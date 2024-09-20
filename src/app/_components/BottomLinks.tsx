import { Button } from '@nextui-org/react'
import Link from 'next/link'
import { api } from '~/trpc/server'

const BottomFriendLinks = async () => {
  const links = await api.friendLink.getBottomLinks()

  return (
    <div className="mx-auto w-full pt-2">
      <div className="flex flex-wrap justify-center gap-2">
        {links.map((link) => (
          <Link href={link.url} key={link.id}>
            <Button
              color="secondary"
              variant="flat"
              size="sm"
              className="text-xs"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.name}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default BottomFriendLinks
