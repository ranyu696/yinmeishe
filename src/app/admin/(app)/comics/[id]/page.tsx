'use client'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@nextui-org/react'
import { type ComicChapter, type ComicImage } from '@prisma/client'
import { EditIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { ChapterForm } from '~/app/components/comics/ChapterForm'
import UploadImageModal from '~/app/components/comics/UploadImageModal'
import { api } from '~/trpc/react'

// 扩展 ComicChapter 类型以包含 images
interface ExtendedComicChapter extends ComicChapter {
  images: ComicImage[]
}

export default function ComicDetailPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? parseInt(params.id, 10) : null
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedChapter, setSelectedChapter] =
    useState<ExtendedComicChapter | null>(null)
  const [page, setPage] = useState(1)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState<ComicImage[]>([])
  const [currentChapterNumber, setCurrentChapterNumber] = useState<
    number | undefined
  >(undefined)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const {
    data: comic,
    isLoading,
    refetch,
  } = api.comic.getById.useQuery(Number(id))
  const createChapterMutation = api.comic.createChapter.useMutation()
  const updateChapterMutation = api.comic.updateChapter.useMutation()
  const deleteChapterMutation = api.comic.deleteChapter.useMutation()

  const chaptersPerPage = 10
  const totalPages = Math.ceil((comic?.chapters?.length ?? 0) / chaptersPerPage)

  const handleCreateChapter = async (chapterData: {
    title: string
    chapterNumber: number
  }) => {
    if (comic) {
      await toast.promise(
        createChapterMutation.mutateAsync({
          comicId: comic.id,
          ...chapterData,
        }),
        {
          pending: '正在创建章节...',
          success: '章节创建成功',
          error: '章节创建失败',
        },
      )
      await refetch()
      onClose()
    }
  }

  const handleOpenUploadModal = (chapterNumber: number) => {
    setCurrentChapterNumber(chapterNumber)
    setUploadModalOpen(true)
  }

  const handleUpdateChapter = async (chapterData: {
    title: string
    chapterNumber: number
  }) => {
    if (selectedChapter) {
      await toast.promise(
        updateChapterMutation.mutateAsync({
          id: selectedChapter.id,
          ...chapterData,
        }),
        {
          pending: '正在更新章节...',
          success: '章节更新成功',
          error: '章节更新失败',
        },
      )
      await refetch()
      onClose()
    }
  }

  const handleDeleteChapter = async (chapterId: number) => {
    if (confirm('确定要删除此章节吗？这将删除所有相关的图片。')) {
      try {
        await toast.promise(deleteChapterMutation.mutateAsync(chapterId), {
          pending: '正在删除章节...',
          success: '章节删除成功',
          error: '章节删除失败',
        })
        await refetch()
      } catch (error) {
        console.error('删除错误:', error)
      }
    }
  }

  const openEditModal = (chapter: ExtendedComicChapter) => {
    setSelectedChapter(chapter)
    onOpen()
  }

  const openImageModal = (images: ComicImage[]) => {
    setSelectedImages(images)
    setImageModalOpen(true)
  }

  const handleUploadSuccess = async () => {
    await refetch()
    toast.success('图片上传成功')
  }

  const columns = [
    { name: '章节', uid: 'chapterNumber' },
    { name: '标题', uid: 'title' },
    { name: '图片数', uid: 'imageCount' },
    { name: '操作', uid: 'actions' },
  ]

  const renderCell = (chapter: ExtendedComicChapter, columnKey: React.Key) => {
    switch (columnKey) {
      case 'chapterNumber':
        return `第 ${chapter.chapterNumber} 章`
      case 'title':
        return chapter.title ?? '无标题'
      case 'imageCount':
        return (
          <Button
            size="sm"
            variant="light"
            color="primary"
            onClick={() => openImageModal(chapter.images)}
          >
            {chapter.images.length} 张图片
          </Button>
        )
      case 'actions':
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              color="primary"
              onClick={() => handleOpenUploadModal(chapter.chapterNumber)}
            >
              上传图片
            </Button>
            <Button
              size="sm"
              color="secondary"
              startContent={<EditIcon size={16} />}
              onPress={() => openEditModal(chapter)}
            >
              编辑
            </Button>
            <Button
              size="sm"
              color="danger"
              startContent={<TrashIcon size={16} />}
              onClick={() => void handleDeleteChapter(chapter.id)}
            >
              删除
            </Button>
          </div>
        )
    }
  }

  if (isLoading || !comic) return <div>Loading...</div>

  return (
    <div className="mx-auto my-14 flex w-full max-w-[95rem] flex-col gap-4 lg:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{comic.title}</h1>
        <Button
          color="primary"
          onPress={() => {
            setSelectedChapter(null)
            onOpen()
          }}
          startContent={<PlusIcon size={16} />}
        >
          添加新章节
        </Button>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">漫画信息</h2>
          </CardHeader>
          <CardBody>
            <Image
              src={comic.coverUrl ?? ''}
              alt={comic.title}
              className="mb-4 h-auto w-full rounded-lg"
            />
            <p>
              <strong>作者:</strong> {comic.author}
            </p>
            <p>
              <strong>分类:</strong> {comic.category.name}
            </p>
            <p>
              <strong>状态:</strong>{' '}
              <Chip color={comic.isActive ? 'success' : 'danger'}>
                {comic.isActive ? '已上架' : '未上架'}
              </Chip>
            </p>
            <p>
              <strong>描述:</strong> {comic.description}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">章节列表</h2>
          </CardHeader>
          <CardBody>
            <Table
              aria-label="章节列表"
              bottomContent={
                <div className="mt-4 flex justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="secondary"
                    page={page}
                    total={totalPages}
                    onChange={(page) => setPage(page)}
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
                items={comic.chapters.slice(
                  (page - 1) * chaptersPerPage,
                  page * chaptersPerPage,
                )}
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
          </CardBody>
        </Card>
      </div>
      <ChapterForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={selectedChapter ? handleUpdateChapter : handleCreateChapter}
        initialData={
          selectedChapter
            ? {
                title: selectedChapter.title ?? '',
                chapterNumber: selectedChapter.chapterNumber,
              }
            : undefined
        }
      />
      <Modal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>章节图片</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1">
              {selectedImages.map((image, index) => (
                <Image
                  key={image.id}
                  src={image.path}
                  alt={`图片 ${index + 1}`}
                  className="h-auto w-full rounded-lg"
                />
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => setImageModalOpen(false)}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <UploadImageModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        comicId={comic.id}
        chapterNumber={currentChapterNumber ?? 0}
      />
    </div>
  )
}
