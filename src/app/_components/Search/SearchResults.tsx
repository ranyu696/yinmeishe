// src/app/_components/Search/SearchResults.tsx

import { Card, CardBody, Image } from '@nextui-org/react'
import Link from 'next/link'
import React from 'react'

interface SearchResult {
  id: number
  title: string
  description: string | null
  url: string
  type: 'novel' | 'comic' | 'picture' | 'video'
  createdAt: Date
  coverUrl: string | null
}

interface SearchResultsProps {
  results: SearchResult[]
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {results.map((result) => (
        <Link key={result.id} href={result.url} className="block">
          <Card key={result.id} className="transition-shadow hover:shadow-lg">
            <Image
              src={result.coverUrl ?? '/placeholder-image.jpg'}
              alt={result.title}
              className="h-48 w-full object-cover"
            />
            <CardBody className="p-2">
              <p className="mt-2 line-clamp-2 text-sm">{result.description}</p>
              <p className="mt-1 text-sm text-gray-500">{result.type}</p>
            </CardBody>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default SearchResults
