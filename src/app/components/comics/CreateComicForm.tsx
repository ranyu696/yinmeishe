import {
  Button,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from '@nextui-org/react'
import { type Category, type Comic } from '@prisma/client'
import React, { useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '~/trpc/react'

type ComicFormData = Omit<Comic, 'id' | 'createdAt' | 'updatedAt' | 'views'>

type ComicFormProps = {
  isOpen: boolean
  onClose: () => void
  onComicSaved: () => void
  categories: Category[]
}
export function CreateComicForm({
  isOpen,
  onClose,
  onComicSaved,
  categories,
}: ComicFormProps) {
  const [comic, setComic] = useState<ComicFormData>({
    title: '',
    author: null,
    description: null,
    categoryId: 0,
    coverUrl: null,
    isActive: true,
  })

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [remoteImageUrl, setRemoteImageUrl] = useState('')

  const createComic = api.comic.createComic.useMutation()

  const handleCoverImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setIsUploading(true)
        try {
          const formData = new FormData()
          formData.append('file', file)
          const response = await fetch('/api/upload/comic/cover', {
            method: 'POST',
            body: formData,
          })
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const result = (await response.json()) as Comic
          setComic((prev) => ({ ...prev, coverUrl: result.coverUrl }))
          setPreviewImage(result.coverUrl)
          setRemoteImageUrl('')
          toast.success('封面图片上传成功')
        } catch (error) {
          console.error('封面图片上传失败:', error)
          toast.error('封面图片上传失败，请重试')
        } finally {
          setIsUploading(false)
        }
      }
    },
    [],
  )

  const handleRemoteImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value
      setRemoteImageUrl(url)
      setPreviewImage(url)
      setComic((prev) => ({ ...prev, coverUrl: url }))
    },
    [],
  )

  const handleSaveComic = async () => {
    try {
      const coverUrl = remoteImageUrl || comic.coverUrl
      const comicData = {
        ...comic,
        coverUrl: coverUrl ?? null,
      }

      const _savedComic = await createComic.mutateAsync(comicData)
      toast.success('新漫画创建成功')

      onClose()
      setComic({
        title: '',
        author: null,
        description: null,
        categoryId: 0,
        coverUrl: null,
        isActive: true,
      })
      setPreviewImage(null)
      setRemoteImageUrl('')
      onComicSaved()
    } catch (error) {
      console.error('漫画保存失败:', error)
      toast.error(`漫画保存失败: ${(error as Error).message}`)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">创建新漫画</ModalHeader>
        <ModalBody>
          <Input
            label="标题"
            value={comic.title}
            onChange={(e) => setComic({ ...comic, title: e.target.value })}
          />
          <Input
            label="作者"
            value={comic.author ?? ''}
            onChange={(e) =>
              setComic({ ...comic, author: e.target.value || null })
            }
          />
          <Textarea
            label="描述"
            value={comic.description ?? ''}
            onChange={(e) =>
              setComic({ ...comic, description: e.target.value || null })
            }
          />
          <Select
            label="分类"
            selectedKeys={[comic.categoryId.toString()]}
            onChange={(e) =>
              setComic({ ...comic, categoryId: parseInt(e.target.value) })
            }
          >
            {categories.map((category) => (
              <SelectItem
                key={category.id.toString()}
                value={category.id.toString()}
              >
                {category.name}
              </SelectItem>
            ))}
          </Select>
          <Input
            label="远程封面图片链接"
            value={remoteImageUrl}
            onChange={handleRemoteImageChange}
            placeholder="输入远程图片链接"
          />
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              disabled={isUploading}
            />
            {isUploading && <span>上传中...</span>}
          </div>
          {previewImage && (
            <div className="mt-2">
              <Image
                src={previewImage}
                alt="Cover preview"
                width={200}
                height={300}
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button
            color="primary"
            onPress={handleSaveComic}
            disabled={isUploading}
          >
            创建
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
