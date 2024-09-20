'use client'

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@nextui-org/react'
import { type NovelChapter } from '@prisma/client'
import { Edit, Eye, Plus, Trash2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { NovelChapterModal } from '~/app/components/novels/NovelChapterModal'
import PreviewModal from '~/app/components/novels/PreviewModal'
import { api } from '~/trpc/react'

interface ChapterWithNumber extends NovelChapter {
  chapterNumber: number
}

export default function NovelChaptersPage() {
  const { id } = useParams()
  const novelId = Number(id)
  const [page, setPage] = useState(1)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure()
  const [editingChapter, setEditingChapter] = useState<NovelChapter | null>(
    null,
  )
  const [previewChapter, setPreviewChapter] =
    useState<ChapterWithNumber | null>(null)

  const { data: novel } = api.novel.getById.useQuery({ id: novelId })
  const { data: chaptersData, refetch } = api.novel.getChapters.useQuery({
    novelId,
    page,
    perPage: 20,
  })

  const deleteChapterMutation = api.novel.deleteChapter.useMutation()
  const getChapterContentQuery = api.novel.getChapterById.useQuery(
    { id: previewChapter?.id ?? -1 },
    { enabled: !!previewChapter },
  )

  const handleAddChapter = () => {
    setEditingChapter(null)
    onOpen()
  }

  const handleEditChapter = (chapter: NovelChapter) => {
    setEditingChapter(chapter)
    onOpen()
  }

  const handlePreviewChapter = (chapter: ChapterWithNumber) => {
    setPreviewChapter(chapter)
    onPreviewOpen()
  }

  const handleDeleteChapter = async (chapterId: number) => {
    if (window.confirm('确定要删除这个章节吗？')) {
      await toast.promise(
        deleteChapterMutation.mutateAsync({ id: chapterId }),
        {
          pending: '正在删除章节...',
          success: '章节已删除',
          error: '删除章节失败',
        },
      )
      await refetch()
    }
  }

  if (!novel) return <div>加载中...</div>

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <h1 className="text-2xl font-bold">{novel.title}</h1>
        </CardHeader>
        <CardBody>
          <p>
            <strong>作者：</strong>
            {novel.author}
          </p>
          <p>
            <strong>描述：</strong>
            {novel.description}
          </p>
          <p>
            <strong>分类：</strong>
            {novel.category.name}
          </p>
          <p>
            <strong>总章节：</strong>
            {chaptersData?.totalCount ?? 0}
          </p>
        </CardBody>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">章节列表</h2>
        <Button
          color="primary"
          onPress={handleAddChapter}
          startContent={<Plus size={16} />}
        >
          添加新章节
        </Button>
      </div>

      <Table
        aria-label="章节列表"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="secondary"
              total={chaptersData?.totalPages ?? 1}
              initialPage={page}
              onChange={(newPage) => {
                setPage(newPage)
                void refetch()
              }}
            />
          </div>
        }
      >
        <TableHeader>
          <TableColumn>章节</TableColumn>
          <TableColumn>标题</TableColumn>
          <TableColumn>创建时间</TableColumn>
          <TableColumn>操作</TableColumn>
        </TableHeader>
        <TableBody emptyContent="没有可显示的章节.">
          {chaptersData?.chapters ? (
            chaptersData.chapters.map((chapter) => (
              <TableRow key={chapter.id}>
                <TableCell>{chapter.chapterNumber}</TableCell>
                <TableCell>{chapter.title}</TableCell>
                <TableCell>
                  {new Date(chapter.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      isIconOnly
                      color="primary"
                      aria-label="编辑"
                      onPress={() => handleEditChapter(chapter)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      aria-label="删除"
                      onPress={() => void handleDeleteChapter(chapter.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                    <Button
                      isIconOnly
                      color="secondary"
                      aria-label="预览"
                      onPress={() => handlePreviewChapter(chapter)}
                    >
                      <Eye size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <Spinner size="sm" />
          )}
        </TableBody>
      </Table>

      <NovelChapterModal
        isOpen={isOpen}
        onClose={onClose}
        novelId={novelId}
        chapter={editingChapter}
        onSuccess={async () => {
          await refetch()
          onClose()
        }}
      />
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={onPreviewClose}
        title={previewChapter?.title ?? ''}
        content={getChapterContentQuery.data?.content ?? '加载中...'}
      />
    </div>
  )
}
