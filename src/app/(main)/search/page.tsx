// src/app/search/page.tsx
import { type Metadata } from 'next'
import SearchFilters from '~/app/_components/Search/SearchFilters'
import SearchResults from '~/app/_components/Search/SearchResults'
import { api } from '~/trpc/server'
import { Suspense } from 'react'
import { Progress } from '@nextui-org/react'

type Props = {
  searchParams: {
    q: string
    type?: 'all' | 'novel' | 'comic' | 'picture' | 'video'
    page?: string
  }
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const query = searchParams.q || ''
  const siteName =
    ((await api.systemSettings.getOne({
      category: 'general',
      key: 'siteName',
    })) as string) ?? '小新网站'

  return {
    title: `搜索结果: ${query} - ${siteName}`,
    description: `查看 "${query}" 的搜索结果`,
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q ?? ''
  const type = searchParams.type ?? 'all'
  const page = parseInt(searchParams.page ?? '1', 10)

  const results = await api.search.performSearch({ query, type, page })

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">搜索结果: {query}</h1>
      <div className="flex flex-col">
       <Suspense fallback={<div><Progress
      size="sm"
      isIndeterminate
      aria-label="Loading..."
      className="max-w-md"
    /></div>}>
        <SearchFilters currentType={type} />
        </Suspense>
        <SearchResults results={results} />
      </div>
    </div>
  )
}
