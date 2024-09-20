import {
  Button,
  Input,
  Navbar,
  NavbarBrand,
  NavbarContent,
} from '@nextui-org/react'
import { PlusCircle, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '~/trpc/server'

async function getlogoUrl() {
  const logoUrl = await api.systemSettings.getOne({
    category: 'general',
    key: 'logoUrl',
  })
  return (logoUrl as string) || '/favicon.ico' // 默认值
}

const Heads = async () => {
  const logoUrl = await getlogoUrl()

  return (
    <Navbar isBordered maxWidth="xl">
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link href="/">
            <Image src={logoUrl} alt="网站Logo" width={100} height={40} />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="center" className="grow">
        <form action="/search" method="GET">
          <Input
            classNames={{
              base: 'max-w-full sm:max-w-[20rem] h-10',
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
        <Link href="/publish">
          <Button
            color="primary"
            variant="flat"
            startContent={<PlusCircle size={18} />}
          >
            发布页
          </Button>
        </Link>
      </NavbarContent>
    </Navbar>
  )
}

export default Heads
