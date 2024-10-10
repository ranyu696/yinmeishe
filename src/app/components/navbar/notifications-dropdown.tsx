'use client'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  NavbarItem,
} from '@nextui-org/react'
import { Bell } from 'lucide-react'
import { useState } from 'react'
import { api } from '~/trpc/react'

interface Notification {
  id: string
  title: string
  description: string
  progress?: number
}

interface CollectionNotificationData {
  apiId: number
  mode: string
  status: 'COMPLETED' | 'FAILED'
}

export const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  api.collector.getCollectionNotifications.useSubscription(undefined, {
    onData: (data: CollectionNotificationData) => {
      const newNotification: Notification = {
        id: `${data.apiId}-${Date.now()}`,
        title: `采集${data.status === 'COMPLETED' ? '完成' : '失败'}`,
        description: `API ${data.apiId} 的${data.mode === 'hours' ? '一天' : '一周'}采集已${data.status === 'COMPLETED' ? '完成' : '失败'}`,
      }
      setNotifications((prev) => [newNotification, ...prev].slice(0, 5))
    },
  })
  return (
    <Dropdown
      placement="bottom-end"
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
    >
      <DropdownTrigger>
        <NavbarItem>
          <Button
            isIconOnly
            variant="light"
            aria-label="Notifications"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Bell />
            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {notifications.length}
              </span>
            )}
          </Button>
        </NavbarItem>
      </DropdownTrigger>
      <DropdownMenu
        className="w-80"
        aria-label="Notifications"
        onAction={(key) => console.log(key)}
      >
        <DropdownSection title="通知">
          {notifications.length === 0 ? (
            <DropdownItem key="no-notifications">暂无通知</DropdownItem>
          ) : (
            notifications.map((notification) => (
              <DropdownItem
                key={notification.id}
                classNames={{
                  base: 'py-2',
                  title: 'text-base font-semibold',
                }}
                description={notification.description}
              >
                {notification.title}
              </DropdownItem>
            ))
          )}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}
