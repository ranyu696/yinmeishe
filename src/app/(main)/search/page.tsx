// src/app/search/page.tsx
import {
  BreadcrumbItem,
  Breadcrumbs,
  Divider,
  Progress,
} from '@nextui-org/react'
import { type Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import VideoCard from '~/app/_components/Card/VideoCard'
import PaginationWrapper from '~/app/_components/Pagination'
import { api } from '~/trpc/server'

const SITE_NAME = '小新视频'

type Props = {
  searchParams: {
    q: string
    page?: string
  }
}

type SearchResult = {
  id: number
  title: string
  description: string | null
  type: 'video' | 'novel' | 'picture' | 'comic'
  createdAt: Date
  coverUrl: string | null
  url: string
}

type SearchResults = {
  videos: SearchResult[]
  totalCount: number
  totalPages: number
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const query = searchParams.q || ''

  return {
    title: `搜索结果: ${query} - ${SITE_NAME}`,
    description: `查看 "${query}" 的视频搜索结果`,
  }
}

function SearchResults({ results }: { results: SearchResults | null }) {
  if (!results?.videos?.length) {
    return <p className="text-center text-gray-600">没有找到相关视频</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {results.videos.map((video) => (
        <Link key={video.id} href={`/voddetail/${video.id}`}>
          <VideoCard video={video} />
        </Link>
      ))}
    </div>
  )
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q ?? ''
  const page = parseInt(searchParams.page ?? '1', 10)

  let results: SearchResults | null = null

  try {
    const apiResults = await api.search.performSearch({ query, page })
    results = {
      videos: apiResults,
      totalCount: apiResults.length,
      totalPages: Math.ceil(apiResults.length / 20), // 假设每页20条记录
    }
  } catch (error) {
    console.error('搜索失败:', error)
  }

  return (
    <div className="container mx-auto px-1 py-2">
      <Breadcrumbs className="mb-4">
        <BreadcrumbItem href="/">首页</BreadcrumbItem>
        <BreadcrumbItem>搜索结果</BreadcrumbItem>
      </Breadcrumbs>

      <h1 className="mb-6 text-3xl font-bold">搜索结果: {query}</h1>

      <Suspense
        fallback={
          <div className="flex justify-center">
            <Progress
              size="sm"
              isIndeterminate
              aria-label="Loading..."
              className="max-w-md"
            />
          </div>
        }
      >
        <SearchResults results={results} />
      </Suspense>

      {results && results.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <PaginationWrapper totalPages={results.totalPages} />
        </div>
      )}

      <Divider className="my-8" />

      {results && (
        <p className="text-center text-gray-600">
          找到 {results.totalCount} 个相关视频
        </p>
      )}
    </div>
  )
}
