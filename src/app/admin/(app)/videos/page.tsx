'use client'

import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Input,
  Pagination,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@nextui-org/react'
import { type Video } from '@prisma/client'
import { Edit, Play, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import DeleteConfirmModal from '~/app/components/shared/DeleteConfirmModal'
import { VideoForm } from '~/app/components/video/VideoForm'
import VideoPlayerModal from '~/app/components/video/VideoPlayerModal'
import { api } from '~/trpc/react'

export default function VideosPage() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(
    undefined,
  )

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure()
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure()
  const {
    isOpen: isPlayerModalOpen,
    onOpen: onPlayerModalOpen,
    onClose: onPlayerModalClose,
  } = useDisclosure()

  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null)
  const [videoToPlay, setVideoToPlay] = useState<Video | null>(null)

  const videosQuery = api.video.getAll.useQuery({
    page,
    perPage,
    search,
    categoryId: categoryFilter,
  })
  const { data: categories = [] } = api.category.getByType.useQuery({
    type: 'Video',
  })
  const deleteVideoMutation = api.video.delete.useMutation()
  const toggleActiveMutation = api.video.toggleActive.useMutation()

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleCategoryFilter = (categoryId: number | undefined) => {
    setCategoryFilter(categoryId)
    setPage(1)
  }

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage)
    setPage(1)
  }

  const handleAddVideo = () => {
    setEditingVideo(null)
    onFormOpen()
  }

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video)
    onFormOpen()
  }

  const handleDeleteVideo = (video: Video) => {
    setVideoToDelete(video)
    onDeleteModalOpen()
  }

  const confirmDelete = async () => {
    if (videoToDelete) {
      try {
        await toast.promise(deleteVideoMutation.mutateAsync(videoToDelete.id), {
          pending: '正在删除视频...',
          success: '视频删除成功',
          error: '删除视频失败',
        })
        await videosQuery.refetch()
        onDeleteModalClose()
      } catch (error) {
        console.error('删除视频失败:', error)
      }
    }
  }

  const handlePlayVideo = (video: Video) => {
    setVideoToPlay(video)
    onPlayerModalOpen()
  }

  const handleToggleActive = async (video: Video, isActive: boolean) => {
    try {
      await toast.promise(
        toggleActiveMutation.mutateAsync({ id: video.id, isActive }),
        {
          pending: '正在更新视频状态...',
          success: `视频状态已更新为${isActive ? '激活' : '停用'}`,
          error: '更新视频状态失败',
        },
      )
      await videosQuery.refetch()
    } catch (error) {
      console.error('更新视频状态失败:', error)
    }
  }

  const handleRefetch = async () => {
    try {
      await videosQuery.refetch()
    } catch (error) {
      console.error('刷新视频列表失败:', error)
      toast.error('刷新视频列表失败')
    }
  }
  return (
    <div className="mx-auto my-14 flex w-full max-w-[95rem] flex-col gap-4 lg:px-6">
      <h1 className="mb-6 text-2xl font-bold">视频管理</h1>
      <Card>
        <CardBody>
          <div className="mb-4 flex items-center justify-between">
            <Input
              className="w-1/3"
              placeholder="搜索视频..."
              startContent={<Search />}
              value={search}
              onValueChange={handleSearch}
            />
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="w-1/2">
                  {categoryFilter
                    ? categories.find((c) => c.id === categoryFilter)?.name
                    : '选择分类'}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="分类筛选"
                selectionMode="single"
                selectedKeys={
                  categoryFilter
                    ? new Set([categoryFilter.toString()])
                    : new Set()
                }
                onSelectionChange={(keys) => {
                  const selected = keys as Set<string>
                  const selectedKey =
                    selected.size > 0 ? Array.from(selected)[0] : undefined
                  handleCategoryFilter(
                    selectedKey ? parseInt(selectedKey, 10) : undefined,
                  )
                }}
              >
                {categories.map((category) => (
                  <DropdownItem key={category.id.toString()}>
                    {category.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              onPress={handleAddVideo}
              startContent={<Plus />}
            >
              添加新视频
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span>总计: {videosQuery.data?.totalCount} 个视频</span>
            <select
              className="rounded border p-1"
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
            >
              {[10, 20, 30, 50].map((value) => (
                <option key={value} value={value}>
                  每页 {value} 条
                </option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {videosQuery.isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : videosQuery.isError ? (
        <div className="text-center text-danger">
          加载失败: {videosQuery.error.message}
        </div>
      ) : (
        <Table
          aria-label="视频列表"
          bottomContent={
            videosQuery.data && videosQuery.data.totalPages > 1 ? (
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="secondary"
                  page={page}
                  total={Math.ceil(
                    (videosQuery.data?.totalCount ?? 0) / perPage,
                  )}
                  onChange={(newPage) => {
                    setPage(newPage)
                    handleRefetch().catch(console.error)
                  }}
                />
              </div>
            ) : null
          }
        >
          <TableHeader>
            <TableColumn>封面</TableColumn>
            <TableColumn>标题</TableColumn>
            <TableColumn>分类</TableColumn>
            <TableColumn>播放次数</TableColumn>
            <TableColumn>状态</TableColumn>
            <TableColumn>操作</TableColumn>
          </TableHeader>
          <TableBody emptyContent="没有可显示的视频。">
            {(videosQuery.data?.videos ?? []).map((video) => (
              <TableRow key={video.id}>
                <TableCell>
                  <Image
                    src={video.coverUrl ?? '/placeholder.png'}
                    alt={video.title}
                    className="h-18 w-32 object-cover"
                    radius="none"
                  />
                </TableCell>
                <TableCell>{video.title}</TableCell>
                <TableCell>{video.category?.name}</TableCell>
                <TableCell>{video.totalPlays}</TableCell>
                <TableCell>
                  <Switch
                    defaultSelected
                    checked={video.isActive}
                    onChange={(e) =>
                      void handleToggleActive(video, e.target.checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      isIconOnly
                      color="primary"
                      aria-label="Edit"
                      onPress={() => handleEditVideo(video)}
                    >
                      <Edit size={20} />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      aria-label="Delete"
                      onPress={() => handleDeleteVideo(video)}
                    >
                      <Trash2 size={20} />
                    </Button>
                    <Button
                      isIconOnly
                      color="success"
                      aria-label="Play"
                      onPress={() => handlePlayVideo(video)}
                    >
                      <Play size={20} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <VideoForm
        isOpen={isFormOpen}
        onClose={onFormClose}
        video={editingVideo}
        onSuccess={async () => {
          try {
            await videosQuery.refetch()
            onFormClose()
          } catch (error) {
            console.error('刷新视频列表失败:', error)
            toast.error('刷新视频列表失败')
          }
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        onConfirm={() => void confirmDelete()}
        title="删除视频"
        content="您确定要删除这个视频吗？此操作不可撤销。"
      />

      {videoToPlay && (
        <VideoPlayerModal
          isOpen={isPlayerModalOpen}
          onClose={onPlayerModalClose}
          video={videoToPlay}
        />
      )}
    </div>
  )
}
