import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  NavbarItem,
} from '@nextui-org/react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DarkModeSwitch } from './darkmodeswitch'

export const UserDropdown = () => {
  const router = useRouter()
  const { data: session, status } = useSession()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.replace('/admin-login')
  }

  if (status === 'loading') {
    return <div>Loading...</div> // 或者返回一个加载指示器
  }

  if (status === 'unauthenticated') {
    return null // 或者返回一个登录按钮
  }

  return (
    <Dropdown>
      <NavbarItem>
        <DropdownTrigger>
          <Avatar
            as="button"
            color="secondary"
            size="md"
            src={
              session?.user?.image ??
              'https://i.pravatar.cc/150?u=a042581f4e29026704d'
            }
          />
        </DropdownTrigger>
      </NavbarItem>
      <DropdownMenu
        aria-label="User menu actions"
        onAction={(actionKey) => console.log({ actionKey })}
      >
        <DropdownItem
          key="profile"
          className="flex w-full flex-col items-start justify-start"
        >
          <p>登录身份</p>
          <p>{session?.user?.email}</p>
        </DropdownItem>
        <DropdownItem key="settings">我的设置</DropdownItem>
        <DropdownItem
          key="logout"
          color="danger"
          className="text-danger"
          onPress={handleLogout}
        >
          退出
        </DropdownItem>
        <DropdownItem key="switch">
          <DarkModeSwitch />
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
