export enum CategoryType {
  Video = 'Video',
  Novel = 'Novel',
  Picture = 'Picture',
  Comic = 'Comic',
}

// 视频资源类型
export interface VideoResource {
  vod_id: number
  vod_name: string
  type_id: number
  type_name: string
  vod_en: string
  vod_time: string
  vod_remarks: string
  vod_play_from: string
  vod_pic: string
  vod_content: string | undefined
  vod_play_url: string
}

// 分类类型
export interface Category {
  type_id: number
  type_pid: number
  type_name: string
}

// API 响应类型
export interface ApiResponse {
  code: number
  msg: string
  page: string
  pagecount: string
  limit: string
  total: number
  list: VideoResource[]
  class: Category[]
}

// 用于 getResources 查询的输入类型
export interface GetResourcesInput {
  apiId: number
  page: number
  categoryId?: number
}

// getResources 查询的返回类型
export interface GetResourcesOutput {
  resources: {
    id: number
    name: string
    category: string
    playerType: string
    updatedAt: string
  }[]
  total: number
  page: number
}

// 外部分类类型
export interface ExternalCategory {
  type_id: number
  type_name: string
}

// 分类映射类型
export interface CategoryMapping {
  externalId: number
  internalId: number
}

// VideoListResponse 和 VideoDetailsResponse 类型
export type VideoListResponse = ApiResponse
export type VideoDetailsResponse = ApiResponse

// CategoryListResponse 类型
export interface CategoryListResponse {
  class: Category[]
}
