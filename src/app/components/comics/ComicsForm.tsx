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
import { type Comic } from '@prisma/client'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '~/trpc/react'
import {
  type CoverUploadData,
  type CoverUploadResult,
  processAndUploadImage,
} from '~/utils/comic/uploadUtils'

type ComicsFormProps = {
  isOpen: boolean
  onClose: () => void
  onComicSaved: () => void
  initialData?: Comic & { categoryId: number }
  isEditing: boolean
}

type ComicFormData = {
  title: string
  author: string
  description: string
  categoryId: number
  coverUrl: string | null
}

export function ComicsForm({
  isOpen,
  onClose,
  onComicSaved,
  initialData,
  isEditing,
}: ComicsFormProps) {
  const [comic, setComic] = useState<ComicFormData>({
    title: '',
    author: '',
    description: '',
    categoryId: 0,
    coverUrl: null,
  })

  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  )
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [remoteImageUrl, setRemoteImageUrl] = useState('')

  const createComic = api.comic.createComic.useMutation()
  const updateComic = api.comic.updateComic.useMutation()
  const uploadCoverMutation = api.comic.uploadCover.useMutation()
  const { data: categoriesData } = api.category.getByType.useQuery({
    type: 'Comic',
  })

  useEffect(() => {
    if (initialData) {
      setComic({
        title: initialData.title,
        author: initialData.author ?? '',
        description: initialData.description ?? '',
        categoryId: initialData.categoryId,
        coverUrl: initialData.coverUrl,
      })
      setPreviewImage(initialData.coverUrl)
      setRemoteImageUrl(initialData.coverUrl ?? '')
    } else {
      setComic({
        title: '',
        author: '',
        description: '',
        categoryId: 0,
        coverUrl: null,
      })
      setPreviewImage(null)
      setRemoteImageUrl('')
    }
  }, [initialData])

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData)
    }
  }, [categoriesData])

  const handleCoverImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setIsUploading(true)
        try {
          const result = await processAndUploadImage(
            file,
            'cover',
            initialData?.id ?? 0,
            (data) =>
              uploadCoverMutation.mutateAsync(
                data as CoverUploadData,
              ) as Promise<CoverUploadResult>,
          )
          if ('coverPath' in result) {
            setComic((prev) => ({ ...prev, coverUrl: result.coverPath }))
            setPreviewImage(result.coverPath)
            setRemoteImageUrl('')
            toast.success('封面图片上传成功')
          } else {
            throw new Error('上传结果类型不正确')
          }
        } catch (error) {
          console.error('封面图片上传失败:', error)
          toast.error('封面图片上传失败，请重试')
        } finally {
          setIsUploading(false)
        }
      }
    },
    [initialData?.id, uploadCoverMutation],
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
      const coverUrl = remoteImageUrl ?? comic.coverUrl
      console.log('使用封面路径保存漫画:', coverUrl) // 调试日志

      const comicData = {
        ...comic,
        author: comic.author ?? undefined,
        description: comic.description ?? undefined,
        coverUrl: coverUrl, // 使用确定的封面路径
      }

      console.log('待保存的漫画数据:', comicData) // 调试日志

      let savedComic
      if (isEditing && initialData) {
        savedComic = await updateComic.mutateAsync({
          id: initialData.id,
          ...comicData,
        })
        toast.success('漫画更新成功')
      } else {
        savedComic = await createComic.mutateAsync(comicData)
        toast.success('新漫画创建成功')
      }

      console.log('Saved comic:', savedComic) // 调试日志

      onClose()
      setComic({
        title: '',
        author: '',
        description: '',
        categoryId: 0,
        coverUrl: null,
      })
      setPreviewImage(null)
      setRemoteImageUrl('')
      onComicSaved()
    } catch (error) {
      console.error('漫画保存失败:', error)
      toast.error('漫画保存失败，请重试')
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
        <ModalHeader className="flex flex-col gap-1">
          {isEditing ? '编辑漫画' : '创建新漫画'}
        </ModalHeader>
        <ModalBody>
          <Input
            label="标题"
            value={comic.title}
            onChange={(e) => setComic({ ...comic, title: e.target.value })}
          />
          <Input
            label="作者"
            value={comic.author}
            onChange={(e) => setComic({ ...comic, author: e.target.value })}
          />
          <Textarea
            label="描述"
            value={comic.description}
            onChange={(e) =>
              setComic({ ...comic, description: e.target.value })
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
            {isEditing ? '保存' : '创建'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
