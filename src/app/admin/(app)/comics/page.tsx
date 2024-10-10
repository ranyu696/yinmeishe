'use client'
import {
  Button,
  Chip,
  Image,
  Input,
  Pagination,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  type Selection,
} from '@nextui-org/react'
import { type Category, type Comic } from '@prisma/client'
import { PlusIcon, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { CreateComicForm } from '~/app/components/comics/CreateComicForm'
import { EditComicForm } from '~/app/components/comics/EditComicForm'
import DeleteConfirmModal from '~/app/components/shared/DeleteConfirmModal'
import { api } from '~/trpc/react'

interface ExtendedComic extends Comic {
  category: Category
  chapters: { id: number }[]
}

export default function ComicsListPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingComic, setEditingComic] = useState<ExtendedComic | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [comicToDelete, setComicToDelete] = useState<number | null>(null)

  const { data, isLoading, refetch } = api.comic.getAll.useQuery({
    page,
    search,
    perPage: 10,
  })

  const { data: categories } = api.category.getByType.useQuery({
    type: 'Comic',
  })

  const deleteMutation = api.comic.deleteComic.useMutation()
  const updateMutation = api.comic.updateComic.useMutation()
  const bulkDeleteMutation = api.comic.bulkDeleteComics.useMutation()
  const selectedCount = selectedKeys instanceof Set ? selectedKeys.size : 0

  const handleEdit = (comic: ExtendedComic) => {
    setEditingComic(comic)
    setIsEditModalOpen(true)
  }

  const handleDelete = (id: number) => {
    setComicToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (comicToDelete) {
      try {
        await toast.promise(deleteMutation.mutateAsync(comicToDelete), {
          pending: '正在删除漫画...',
          success: '漫画已成功删除',
          error: '删除漫画失败',
        })
        await refetch()
      } catch (error) {
        console.error('删除漫画时出错:', error)
      }
    }
    setIsDeleteModalOpen(false)
    setComicToDelete(null)
  }

  const handleBulkDelete = async () => {
    const selectedIds = Array.from(selectedKeys).map(Number)
    try {
      await toast.promise(bulkDeleteMutation.mutateAsync(selectedIds), {
        pending: '正在批量删除漫画...',
        success: '漫画已成功批量删除',
        error: '批量删除漫画失败',
      })
      await refetch()
      setSelectedKeys(new Set())
    } catch (error) {
      console.error('批量删除漫画时出错:', error)
    }
  }

  const handleActiveToggle = async (id: number, currentActive: boolean) => {
    try {
      await toast.promise(
        updateMutation.mutateAsync({ id, isActive: !currentActive }),
        {
          pending: '正在更新漫画状态...',
          success: '漫画状态已成功更新',
          error: '更新漫画状态失败',
        },
      )
      await refetch()
    } catch (error) {
      console.error('更新漫画状态时出错:', error)
    }
  }

  const handleComicSaved = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setEditingComic(null)
    void refetch()
  }

  const columns = [
    { name: '封面', uid: 'cover' },
    { name: '标题', uid: 'title' },
    { name: '作者', uid: 'author' },
    { name: '分类', uid: 'category' },
    { name: '章节', uid: 'chapters' },
    { name: '状态', uid: 'status' },
    { name: '操作', uid: 'actions' },
  ]

  const renderCell = (comic: ExtendedComic, columnKey: React.Key) => {
    switch (columnKey) {
      case 'cover':
        return (
          <Image
            src={comic.coverUrl ?? '/placeholder.png'}
            alt={comic.title}
            width={50}
            height={75}
          />
        )
      case 'title':
        return comic.title
      case 'author':
        return comic.author ?? 'Unknown'
      case 'category':
        return comic.category?.name ?? 'Uncategorized'
      case 'chapters':
        return comic.chapters?.length ?? 0
      case 'status':
        return (
          <Chip color={comic.isActive ? 'success' : 'danger'} variant="flat">
            {comic.isActive ? 'Active' : 'Inactive'}
          </Chip>
        )
      case 'actions':
        return (
          <div className="flex flex-wrap items-center gap-2">
            <Tooltip content="章节管理">
              <Button
                as={Link}
                href={`/admin/comics/${comic.id}`}
                size="sm"
                color="primary"
              >
                章节
              </Button>
            </Tooltip>
            <Tooltip content="编辑">
              <Button
                size="sm"
                color="secondary"
                onClick={() => handleEdit(comic)}
              >
                编辑
              </Button>
            </Tooltip>
            <Tooltip content="删除">
              <Button
                size="sm"
                color="danger"
                onClick={() => handleDelete(comic.id)}
              >
                删除
              </Button>
            </Tooltip>
            <Switch
              size="sm"
              color="success"
              isSelected={comic.isActive}
              onValueChange={() =>
                void handleActiveToggle(comic.id, comic.isActive)
              }
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="mx-auto my-14 flex w-full max-w-[95rem] flex-col gap-4 lg:px-6">
      <h1 className="mb-4 text-2xl font-bold">漫画管理</h1>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <Input
          placeholder="搜索漫画..."
          value={search}
          onValueChange={setSearch}
          startContent={<SearchIcon className="text-default-400" />}
          className="w-full sm:max-w-[44%]"
        />
        <div className="flex gap-3">
          {selectedCount > 0 && (
            <Button color="danger" onPress={handleBulkDelete}>
              批量删除
            </Button>
          )}
          <Button
            color="primary"
            onPress={() => setIsCreateModalOpen(true)}
            startContent={<PlusIcon size={16} />}
          >
            添加新漫画
          </Button>
        </div>
      </div>
      <Table
        aria-label="漫画列表"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={data?.totalPages ?? 1}
              onChange={setPage}
            />
          </div>
        }
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === 'actions' ? 'center' : 'start'}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={data?.comics ?? []}
          emptyContent={isLoading ? 'Loading...' : 'No comics found'}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <CreateComicForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onComicSaved={handleComicSaved}
        categories={categories ?? []}
      />
      {editingComic && (
        <EditComicForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingComic(null)
          }}
          onComicSaved={handleComicSaved}
          categories={categories ?? []}
          initialData={editingComic}
        />
      )}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="删除漫画"
        content="您确定要删除这个漫画吗？此操作不可撤销。"
      />
    </div>
  )
}
