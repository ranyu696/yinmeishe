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
  Switch,
  Textarea,
} from '@nextui-org/react'
import { type Category, CategoryType, type Novel } from '@prisma/client'
import { Link, Upload } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '~/trpc/react'

interface NovelEditFormProps {
  isOpen: boolean
  onClose: () => void
  novel: Novel
  onSuccess: () => void
}

type NovelFormData = Omit<
  Novel,
  'id' | 'createdAt' | 'updatedAt' | 'views' | 'externalId'
>

export const NovelEditForm: React.FC<NovelEditFormProps> = ({
  isOpen,
  onClose,
  novel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<NovelFormData>({
    title: '',
    author: '',
    description: '',
    coverUrl: null,
    categoryId: 0,
    isActive: true,
  })
  const [imageUploadType, setImageUploadType] = useState<'local' | 'remote'>(
    'remote',
  )
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const { data: categories } = api.category.getByType.useQuery({
    type: CategoryType.Novel,
  })

  const updateNovelMutation = api.novel.update.useMutation()

  useEffect(() => {
    if (novel) {
      setFormData({
        title: novel.title,
        author: novel.author,
        description: novel.description,
        coverUrl: novel.coverUrl,
        categoryId: novel.categoryId,
        isActive: novel.isActive,
      })
      setPreviewImage(novel.coverUrl)
    }
  }, [novel])

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/novels/upload-cover', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const data = (await response.json()) as Novel
      if (typeof data.coverUrl === 'string') {
        setFormData((prev) => ({ ...prev, coverUrl: data.coverUrl }))
        setPreviewImage(data.coverUrl)
        toast.success('封面图片上传成功')
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      toast.error('封面图片上传失败，请重试')
    }
  }

  const handleRemoteImageChange = (url: string) => {
    setFormData((prev) => ({ ...prev, coverUrl: url }))
    setPreviewImage(url)
  }

  const handleSubmit = async () => {
    try {
      await updateNovelMutation.mutateAsync({
        id: novel.id,
        ...formData,
      })
      toast.success('小说更新成功')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('保存小说失败:', error)
      toast.error('保存小说失败，请重试')
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
        <ModalHeader>编辑小说</ModalHeader>
        <ModalBody>
          <Input
            label="标题"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <Input
            label="作者"
            value={formData.author}
            onChange={(e) =>
              setFormData({ ...formData, author: e.target.value })
            }
          />
          <Textarea
            label="描述"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <div className="mb-4 flex justify-between">
            <Button
              color={imageUploadType === 'local' ? 'primary' : 'default'}
              onClick={() => setImageUploadType('local')}
              startContent={<Upload size={16} />}
            >
              上传本地图片
            </Button>
            <Button
              color={imageUploadType === 'remote' ? 'primary' : 'default'}
              onClick={() => setImageUploadType('remote')}
              startContent={<Link size={16} />}
            >
              使用远程链接
            </Button>
          </div>
          {imageUploadType === 'local' ? (
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  void handleImageUpload(file).catch((error) => {
                    console.error('Image upload failed:', error)
                    toast.error('图片上传失败，请重试')
                  })
                }
              }}
            />
          ) : (
            <Input
              label="远程图片链接"
              value={formData.coverUrl ?? ''}
              onChange={(e) => handleRemoteImageChange(e.target.value)}
              placeholder="请输入图片URL"
            />
          )}
          {previewImage && (
            <div className="mt-4">
              <Image
                src={previewImage}
                alt="封面预览"
                width={200}
                height={300}
              />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              isSelected={formData.isActive}
              onValueChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <span>是否激活</span>
          </div>
          <Select
            label="分类"
            selectedKeys={[formData.categoryId.toString()]}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string
              setFormData({
                ...formData,
                categoryId: parseInt(selectedKey, 10),
              })
            }}
            required
          >
            {categories ? (
              categories.map((category: Category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" key="loading">
                加载中...
              </SelectItem>
            )}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            更新
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
