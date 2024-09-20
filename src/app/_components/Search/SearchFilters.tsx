// src/app/_components/Search/SearchFilters.tsx
'use client'
import { Radio, RadioGroup } from '@nextui-org/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

type SearchType = 'all' | 'novel' | 'comic' | 'picture' | 'video'

interface SearchFiltersProps {
  currentType: SearchType
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ currentType }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTypeChange = (value: string) => {
    const query = searchParams.get('q') ?? ''
    router.push(`/search?q=${query}&type=${value}`)
  }

  return (
    <div className="mb-4">
      <RadioGroup
        value={currentType}
        onValueChange={handleTypeChange}
        orientation="horizontal"
        className="flex flex-wrap gap-2"
      >
        <Radio value="all">全部</Radio>
        <Radio value="novel">小说</Radio>
        <Radio value="comic">漫画</Radio>
        <Radio value="picture">图片</Radio>
        <Radio value="video">视频</Radio>
      </RadioGroup>
    </div>
  )
}

export default SearchFilters
