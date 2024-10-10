import { type FriendLink } from '@prisma/client'
import { api } from '~/trpc/server'
import TrackableLink from './Trackable/TrackableLink'

const BottomFriendLinks = async () => {
  const links = await api.friendLink.getBottomLinks()

  return (
    <div className="mx-auto mt-2 w-full">
      <h2 className="mb-2 text-sm font-bold">友情链接</h2>
      <div className="-mx-0.5 flex flex-wrap">
        {links.map((link: FriendLink) => (
          <div
            key={link.id}
            className="w-[22%] p-0.5 sm:w-[24%] md:w-[16%] lg:w-[9.8%]"
          >
            <TrackableLink href={link.url} name={link.name} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default BottomFriendLinks
