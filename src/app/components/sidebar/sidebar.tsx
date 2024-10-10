import { Avatar, Tooltip } from '@nextui-org/react'
import { usePathname } from 'next/navigation'
import { FilterIcon } from '../icons/sidebar/filter-icon'
import { SettingsIcon } from '../icons/sidebar/settings-icon'
import { useSidebarContext } from '../layout/layout-context'
import { CompaniesDropdown } from './companies-dropdown'
import { SidebarItem } from './sidebar-item'
import { SidebarMenu } from './sidebar-menu'
import { Sidebar } from './sidebar.styles'

import {
  Cable,
  ChartArea,
  ChartBarStacked,
  Combine,
  Images,
  LayoutPanelLeft,
  LibraryBig,
  Link,
  ListVideo,
  Megaphone,
  Settings,
  Shell,
  Tag,
} from 'lucide-react'

export const SidebarWrapper = () => {
  const pathname = usePathname()
  const { collapsed, setCollapsed } = useSidebarContext()

  return (
    <aside className="sticky top-0 z-20 h-screen">
      {collapsed ? (
        <div className={Sidebar.Overlay()} onClick={setCollapsed} />
      ) : null}
      <div
        className={Sidebar({
          collapsed: collapsed,
        })}
      >
        <div className={Sidebar.Header()}>
          <CompaniesDropdown />
        </div>
        <div className="flex h-full flex-col justify-between">
          <div className={Sidebar.Body()}>
            <SidebarItem
              title="仪表台"
              icon={<LayoutPanelLeft />}
              isActive={pathname === '/'}
              href="/admin"
            />

            <SidebarMenu title="内容管理">
              <SidebarItem
                isActive={pathname.startsWith('/admin/videos')}
                title="视频管理"
                icon={<ListVideo />}
                href="/admin/videos"
              />
              <SidebarItem
                isActive={pathname.startsWith('/admin/novels')}
                title="小说管理"
                icon={<LibraryBig />}
                href="/admin/novels"
              />
              <SidebarItem
                isActive={pathname.startsWith('/admin/pictures')}
                title="图片管理"
                icon={<Images />}
                href="/admin/pictures"
              />
              <SidebarItem
                isActive={pathname.startsWith('/admin/comics')}
                title="漫画管理"
                icon={<Shell />}
                href="/admin/comics"
              />
            </SidebarMenu>

            <SidebarMenu title="系统管理">
              <SidebarItem
                isActive={pathname === '/categories'}
                title="分类管理"
                icon={<ChartBarStacked />}
                href="/admin/categories"
              />
              <SidebarItem
                isActive={pathname === '/settings'}
                title="系统设置"
                icon={<Settings />}
                href="/admin/settings"
              />
              <SidebarItem
                isActive={pathname === '/ads'}
                title="广告管理"
                icon={<Megaphone />}
                href="/admin/ads"
              />
              <SidebarItem
                isActive={pathname === '/links'}
                title="友链设置"
                icon={<Link />}
                href="/admin/links"
              />
              <SidebarItem
                isActive={pathname === '/tags'}
                title="标签管理"
                icon={<Tag />}
                href="/admin/tags"
              />
              <SidebarItem
                isActive={pathname === '/collection'}
                title="采集管理"
                icon={<Cable />}
                href="/admin/collection"
              />
              <SidebarItem
                isActive={pathname === '/ingest-settings'}
                title="入库管理"
                icon={<Combine />}
                href="/admin/ingest-settings"
              />
            </SidebarMenu>

            <SidebarMenu title="分析">
              <SidebarItem
                isActive={pathname === '/reports'}
                title="统计图表"
                icon={<ChartArea />}
                href="/reports"
              />
            </SidebarMenu>
          </div>
          <div className={Sidebar.Footer()}>
            <Tooltip content="Settings" color="primary">
              <div className="max-w-fit">
                <SettingsIcon />
              </div>
            </Tooltip>
            <Tooltip content="Adjustments" color="primary">
              <div className="max-w-fit">
                <FilterIcon />
              </div>
            </Tooltip>
            <Tooltip content="Profile" color="primary">
              <Avatar
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                size="sm"
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </aside>
  )
}
