'use client'

import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
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
import { type Novel } from '@prisma/client'
import { Book, Edit, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { NovelCreateForm } from '~/app/components/novels/NovelCreateForm'
import { NovelEditForm } from '~/app/components/novels/NovelEditForm'
import DeleteConfirmModal from '~/app/components/shared/DeleteConfirmModal'
import { api } from '~/trpc/react'

export default function NovelsPage() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(
    undefined,
  )
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]))

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure()
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure()
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [novelToDelete, setNovelToDelete] = useState<Novel | null>(null)

  const novelsQuery = api.novel.getAll.useQuery({
    page,
    perPage,
    search,
    categoryId: categoryFilter,
  })
  const { data: categories = [] } = api.category.getByType.useQuery({
    type: 'Novel',
  })
  const deleteNovelMutation = api.novel.delete.useMutation()
  const toggleActiveMutation = api.novel.toggleActive.useMutation()
  const updateCategoryMutation = api.novel.updateCategory.useMutation()
  const deleteMultipleNovelsMutation = api.novel.deleteMany.useMutation()

  const selectedNovelIds = useMemo(() => {
    return Array.from(selectedKeys).map((key) => parseInt(key))
  }, [selectedKeys])

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

  const handleAddNovel = () => {
    onCreateOpen()
  }

  const handleEditNovel = (novel: Novel) => {
    setEditingNovel(novel)
    onEditOpen()
  }

  const handleDeleteNovel = (novel: Novel) => {
    setNovelToDelete(novel)
    setIsDeleteModalOpen(true)
  }

  const handleBulkDelete = async () => {
    try {
      await deleteMultipleNovelsMutation.mutateAsync(selectedNovelIds)
      toast.success('批量删除小说成功')
      await novelsQuery.refetch()
      setSelectedKeys(new Set())
    } catch (error) {
      console.error('批量删除小说失败:', error)
      toast.error('批量删除小说失败，请重试')
    }
  }

  const handleBulkUpdateCategory = async (categoryId: number) => {
    try {
      await updateCategoryMutation.mutateAsync({
        ids: selectedNovelIds,
        categoryId,
      })
      toast.success('批量更新分类成功')
      await novelsQuery.refetch()
      setSelectedKeys(new Set())
    } catch (error) {
      console.error('批量更新分类失败:', error)
      toast.error('批量更新分类失败，请重试')
    }
  }

  const confirmDelete = async () => {
    if (novelToDelete) {
      await toast.promise(
        deleteNovelMutation.mutateAsync({ id: novelToDelete.id }),
        {
          pending: '正在删除小说...',
          success: '小说删除成功',
          error: '删除小说失败',
        },
      )
      await novelsQuery.refetch()
      setIsDeleteModalOpen(false)
      setNovelToDelete(null)
    }
  }

  const handleToggleActive = async (novel: Novel, isActive: boolean) => {
    await toast.promise(
      toggleActiveMutation.mutateAsync({ id: novel.id, isActive }),
      {
        pending: '正在更新小说状态...',
        success: `小说状态已更新为${isActive ? '激活' : '停用'}`,
        error: '更新小说状态失败',
      },
    )
    await novelsQuery.refetch()
  }

  return (
    <div className="mx-auto my-14 flex w-full max-w-[95rem] flex-col gap-4 lg:px-6">
      <h1 className="mb-6 text-2xl font-bold">小说管理</h1>
      <Card>
        <CardBody>
          <div className="mb-4 flex items-center justify-between">
            <Input
              className="w-1/3"
              placeholder="搜索小说..."
              startContent={<Search />}
              value={search}
              onValueChange={handleSearch}
            />
            <div className="flex items-center space-x-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="bordered">
                    {categoryFilter
                      ? categories.find((c) => c.id === categoryFilter)?.name
                      : '选择分类'}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="分类选择"
                  onAction={(key) =>
                    handleCategoryFilter(
                      key === 'all' ? undefined : Number(key),
                    )
                  }
                >
                  {categories.map((category) => (
                    <DropdownItem key={category.id.toString()}>
                      {category.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Button
                color="danger"
                onPress={handleBulkDelete}
                isDisabled={selectedKeys.size === 0}
              >
                批量删除
              </Button>
              <Dropdown>
                <DropdownTrigger>
                  <Button isDisabled={selectedKeys.size === 0}>
                    批量移动分类
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="批量移动分类"
                  onAction={(key) => handleBulkUpdateCategory(Number(key))}
                >
                  {categories.map((category) => (
                    <DropdownItem key={category.id}>
                      {category.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Button
                color="primary"
                onPress={handleAddNovel}
                startContent={<Plus />}
              >
                添加新小说
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>总计: {novelsQuery.data?.totalCount} 本小说</span>
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

      {novelsQuery.isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : novelsQuery.isError ? (
        <div className="text-center text-danger">
          加载失败: {novelsQuery.error.message}
        </div>
      ) : (
        <Table
          aria-label="小说列表"
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={(selection) => {
            setSelectedKeys(selection as Set<string>)
          }}
          bottomContent={
            novelsQuery.data && novelsQuery.data.totalPages > 1 ? (
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="secondary"
                  page={page}
                  total={novelsQuery.data.totalPages}
                  onChange={(newPage) => {
                    setPage(newPage)
                    void novelsQuery.refetch()
                  }}
                />
              </div>
            ) : null
          }
        >
          <TableHeader>
            <TableColumn>标题</TableColumn>
            <TableColumn>作者</TableColumn>
            <TableColumn>分类</TableColumn>
            <TableColumn>章节数</TableColumn>
            <TableColumn>浏览量</TableColumn>
            <TableColumn>添加时间</TableColumn>
            <TableColumn>状态</TableColumn>
            <TableColumn>操作</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent="没有可显示的小说。"
            items={novelsQuery.data?.novels ?? []}
          >
            {(novel) => (
              <TableRow key={novel.id}>
                <TableCell>{novel.title}</TableCell>
                <TableCell>{novel.author}</TableCell>
                <TableCell>{novel.category?.name}</TableCell>
                <TableCell>{novel.chapterCount}</TableCell>
                <TableCell>{novel.views}</TableCell>
                <TableCell>
                  {new Date(novel.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Switch
                    isSelected={novel.isActive}
                    onValueChange={(isActive) =>
                      void handleToggleActive(novel, isActive)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      isIconOnly
                      color="primary"
                      aria-label="Edit"
                      onPress={() => handleEditNovel(novel)}
                    >
                      <Edit size={20} />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      aria-label="Delete"
                      onPress={() => handleDeleteNovel(novel)}
                    >
                      <Trash2 size={20} />
                    </Button>
                    <Button
                      isIconOnly
                      color="secondary"
                      aria-label="Chapters"
                      as="a"
                      href={`/admin/novels/${novel.id}`}
                    >
                      <Book size={20} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <NovelCreateForm
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onSuccess={async () => {
          await novelsQuery.refetch()
          onCreateClose()
        }}
      />
      {editingNovel && (
        <NovelEditForm
          isOpen={isEditOpen}
          onClose={onEditClose}
          novel={editingNovel}
          onSuccess={async () => {
            await novelsQuery.refetch()
            onEditClose()
          }}
        />
      )}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => void confirmDelete()}
        title="删除小说"
        content="您确定要删除这本小说吗？此操作不可撤销。"
      />
    </div>
  )
}
