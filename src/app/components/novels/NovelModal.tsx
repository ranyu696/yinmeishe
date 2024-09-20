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

interface NovelModalProps {
  isOpen: boolean
  onClose: () => void
  novel?: Novel | null
  onSuccess: () => void
}

export const NovelModal: React.FC<NovelModalProps> = ({
  isOpen,
  onClose,
  novel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    coverUrl: '',
    categoryId: '',
    isActive: true,
    shouldSync: false,
  })
  const [imageUploadType, setImageUploadType] = useState<'local' | 'remote'>(
    'remote',
  )
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const { data: categories } = api.category.getByType.useQuery({
    type: CategoryType.Novel,
  })

  const createNovelMutation = api.novel.create.useMutation()
  const updateNovelMutation = api.novel.update.useMutation()
  const uploadCoverMutation = api.novel.uploadCover.useMutation()

  useEffect(() => {
    if (novel) {
      setFormData({
        title: novel.title,
        author: novel.author ?? '',
        description: novel.description ?? '',
        coverUrl: novel.coverUrl ?? '',
        categoryId: novel.categoryId.toString(),
        isActive: novel.isActive,
        shouldSync: false,
      })
      setPreviewImage(novel.coverUrl ?? null)
    } else {
      resetForm()
    }
  }, [novel, isOpen])

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      coverUrl: '',
      categoryId: '',
      isActive: true,
      shouldSync: false,
    })
    setPreviewImage(null)
    setImageUploadType('remote')
  }

  const handleImageUpload = async (file: File) => {
    try {
      const base64 = await fileToBase64(file)
      const result = await uploadCoverMutation.mutateAsync({
        imageSource: base64,
        shouldSync: formData.shouldSync,
      })
      setFormData((prev) => ({ ...prev, coverUrl: result.coverUrl }))
      setPreviewImage(result.coverUrl)
      toast.success('封面图片上传成功')
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
      const data = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        coverUrl: formData.coverUrl,
        categoryId: parseInt(formData.categoryId),
        isActive: formData.isActive,
      }
      if (novel) {
        await updateNovelMutation.mutateAsync({ id: novel.id, ...data })
        toast.success('小说更新成功')
      } else {
        await createNovelMutation.mutateAsync(data)
        toast.success('小说创建成功')
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('保存小说失败:', error)
      toast.error('保存小说失败，请重试')
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => {
        if (error instanceof Error) {
          reject(new Error('读取文件失败: ' + error.message))
        } else {
          reject(new Error('读取文件失败: 未知错误'))
        }
      }
    })
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader>{novel ? '编辑小说' : '创建新小说'}</ModalHeader>
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
              value={formData.coverUrl}
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
              checked={formData.shouldSync}
              onChange={(e) =>
                setFormData({ ...formData, shouldSync: e.target.checked })
              }
            />
            <span>同步图片到本地</span>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
            <span>是否激活</span>
          </div>
          <Select
            label="分类"
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value })
            }
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
            {novel ? '更新' : '创建'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
