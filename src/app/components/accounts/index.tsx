'use client'
import { Button, Input } from '@nextui-org/react'
import Link from 'next/link'
import { DotsIcon } from '~/app/components/icons/accounts/dots-icon'
import { ExportIcon } from '~/app/components/icons/accounts/export-icon'
import { InfoIcon } from '~/app/components/icons/accounts/info-icon'
import { TrashIcon } from '~/app/components/icons/accounts/trash-icon'
import { HouseIcon } from '~/app/components/icons/breadcrumb/house-icon'
import { UsersIcon } from '~/app/components/icons/breadcrumb/users-icon'
import { SettingsIcon } from '~/app/components/icons/sidebar/settings-icon'
import { TableWrapper } from '~/app/components/table/table'
import { AddUser } from './add-user'

export const Accounts = () => {
  return (
    <div className="mx-auto my-14 flex w-full max-w-[95rem] flex-col gap-4 lg:px-6">
      <ul className="flex">
        <li className="flex gap-2">
          <HouseIcon />
          <Link href="/">
            <span>Home</span>
          </Link>
          <span> / </span>{' '}
        </li>

        <li className="flex gap-2">
          <UsersIcon />
          <span>Users</span>
          <span> / </span>{' '}
        </li>
        <li className="flex gap-2">
          <span>List</span>
        </li>
      </ul>

      <h3 className="text-xl font-semibold">All Accounts</h3>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
          <Input
            classNames={{
              input: 'w-full',
              mainWrapper: 'w-full',
            }}
            placeholder="Search users"
          />
          <SettingsIcon />
          <TrashIcon />
          <InfoIcon />
          <DotsIcon />
        </div>
        <div className="flex flex-row flex-wrap gap-3.5">
          <AddUser />
          <Button color="primary" startContent={<ExportIcon />}>
            Export to CSV
          </Button>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[95rem]">
        <TableWrapper />
      </div>
    </div>
  )
}
