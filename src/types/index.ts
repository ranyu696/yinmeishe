export enum CategoryType {
  Video = 'Video',
  Novel = 'Novel',
  Picture = 'Picture',
  Comic = 'Comic',
}

// 严格的Category类型
export interface StrictCategory {
  id: number
  name: string
  type: CategoryType
}

// API响应的Category类型
export interface ApiCategory {
  id: number
  name: string
  type: string
}

// 用于表单输入的Category类型
export type CategoryInput = Omit<StrictCategory, 'id'> & {
  id?: number
}

// 通用Category类型，用于大多数情况
export type Category = StrictCategory | ApiCategory
export interface Video {
  id: number
  title: string
  description: string | null
  thumbnailUrl: string | null
  playUrl: string
  playerType: string
  categoryId: number
  totalPlays: number
  dailyPlays: number
  weeklyPlays: number
  createdAt: Date
  updatedAt: Date
  category?: {
    name: string
  }
}

export interface VideoInput {
  title: string
  description: string
  thumbnailUrl: string
  playUrl: string
  categoryId: number
}
export interface Novel {
  id: number
  categoryId: number
  title: string
  author: string
  description: string
  coverImagePath: string
  viewCount: number
  createdAt: Date
  updatedAt: Date
  category: Category
}

export interface Chapter {
  id: number
  novelId: number
  chapterNumber: number
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface NovelListData {
  novels: Novel[]
  totalPages: number
  totalCount: number // 添加这行
}
export enum AdvertisementType {
  BANNER = 'BANNER',
  ICON = 'ICON',
}

export interface Advertisement {
  id: number
  type: AdvertisementType
  title?: string
  imagePath: string
  linkUrl?: string
  startDate?: Date
  endDate?: Date
  order: number
}
export interface DataSource {
  id: number
  name: string
  baseUrl: string
  apiKey: string | null
  listPath: string
  detailPath: string
  createdAt: Date
  updatedAt: Date
  categories: { internalCategoryId: number | null }[]
}
export interface Task {
  id: number
  status: string
  processedItems: number
  totalItems: number
  startedAt: Date
  completedAt: Date | null
  // 添加其他必要的字段
}
