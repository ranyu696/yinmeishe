import { Input, Navbar, NavbarBrand, NavbarContent } from '@nextui-org/react'
import { Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { DarkModeSwitch } from './DarkModeSwitch'

const Header = async () => {
  return (
    <Navbar isBordered maxWidth="xl">
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link href="/">
            <Image src="/logo.jpg" alt="淫妹社" width={100} height={40} />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="center" className="grow">
        <form action="/search" method="GET">
          <Input
            classNames={{
              base: 'max-w-full sm:max-w-[30rem] h-10',
              mainWrapper: 'h-full',
              input: 'text-small',
              inputWrapper:
                'h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20',
            }}
            placeholder="搜索..."
            size="sm"
            startContent={<Search size={18} />}
            type="search"
            name="q"
          />
        </form>
      </NavbarContent>

      <NavbarContent justify="end">
        <DarkModeSwitch />
      </NavbarContent>
    </Navbar>
  )
}

export default Header
