'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NavButton = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname()
  const isActive = pathname.startsWith(href)

  return (
    <Link href={href} className="flex-1">
      <button
        className={`w-full px-1 py-2 text-center transition-colors duration-200 
                    ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }
                    truncate rounded-md
                    text-xs font-medium sm:text-sm md:text-base
                    lg:text-lg`}
      >
        {label}
      </button>
    </Link>
  )
}

const Navbar = () => {
  return (
    <nav className="mx-auto w-full shadow-md">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-between space-x-2 py-2 sm:space-x-4">
          <NavButton href="/" label="首页" />
          <NavButton href="/videos" label="视频" />
          <NavButton href="/novels" label="小说" />
          <NavButton href="/pictures" label="图片" />
          <NavButton href="/comics" label="漫画" />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
