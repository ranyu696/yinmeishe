// app/_components/PaginationWrapper.tsx
'use client'

import { Pagination } from '@nextui-org/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface PaginationWrapperProps {
  totalPages: number
}

export default function PaginationWrapper({
  totalPages,
}: PaginationWrapperProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentPage = Number(searchParams.get('page')) || 1

  const handlePageChange = (page: number) => {
    router.push(`${pathname}?page=${page}`)
  }

  return (
    <Pagination
      total={totalPages}
      page={currentPage}
      onChange={handlePageChange}
      showControls
      color="primary"
      size="lg"
    />
  )
}
