'use client'
import { Link } from '@nextui-org/react'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { TableWrapper } from '../table/table'
import { CardAgents } from './card-agents'
import { CardBalance1 } from './card-balance1'
import { CardBalance2 } from './card-balance2'
import { CardBalance3 } from './card-balance3'
import { CardTransactions } from './card-transactions'

const Chart = dynamic(
  () => import('../charts/steam').then((mod) => mod.Steam),
  {
    ssr: false,
  },
)

export const Content = () => (
  <div className="h-full lg:px-6">
    <div className="mx-auto flex w-full max-w-[90rem] flex-wrap justify-center gap-4  px-4 pt-3 sm:pt-10 lg:px-0 xl:flex-nowrap xl:gap-6">
      <div className="mt-6 flex w-full flex-col gap-6">
        {/* Card Section Top */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">Available Balance</h3>
          <div className="grid w-full grid-cols-1 justify-center gap-5  md:grid-cols-2 2xl:grid-cols-3">
            <CardBalance1 />
            <CardBalance2 />
            <CardBalance3 />
          </div>
        </div>

        {/* Chart */}
        <div className="flex h-full flex-col gap-2">
          <h3 className="text-xl font-semibold">Statistics</h3>
          <div className="w-full rounded-2xl bg-default-50 p-6 shadow-lg ">
            <Chart />
          </div>
        </div>
      </div>

      {/* Left Section */}
      <div className="mt-4 flex w-full flex-col gap-2 xl:max-w-md">
        <h3 className="text-xl font-semibold">Section</h3>
        <div className="flex flex-col flex-wrap justify-center gap-4 md:flex-col md:flex-nowrap">
          <CardAgents />
          <CardTransactions />
        </div>
      </div>
    </div>

    {/* Table Latest Users */}
    <div className="mx-auto flex w-full max-w-[90rem] flex-col justify-center gap-3  px-4 py-5 lg:px-0">
      <div className="flex  flex-wrap justify-between">
        <h3 className="text-center text-xl font-semibold">Latest Users</h3>
        <Link
          href="/accounts"
          as={NextLink}
          color="primary"
          className="cursor-pointer"
        >
          View All
        </Link>
      </div>
      <TableWrapper />
    </div>
  </div>
)
