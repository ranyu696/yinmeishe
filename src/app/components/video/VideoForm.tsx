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
import { type Category, CategoryType, type Video } from '@prisma/client'
import { Link, Upload } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '~/trpc/react'
import { processAndUploadImage } from '~/utils/video/uploadUtils'

interface VideoFormProps {
  isOpen: boolean
  onClose: () => void
  video?: Video | null
  onSuccess: () => void
}

export const VideoForm: React.FC<VideoFormProps> = ({
  isOpen,
  onClose,
  video,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverUrl: '',
    playUrl: '',
    categoryId: '',
    shouldSync: false,
  })
  const [imageUploadType, setImageUploadType] = useState<'local' | 'remote'>(
    'remote',
  )
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const { data: categories } = api.category.getByType.useQuery({
    type: CategoryType.Video,
  })

  const createVideoMutation = api.video.create.useMutation()
  const updateVideoMutation = api.video.update.useMutation()
  const uploadCoverMutation = api.video.uploadCover.useMutation()

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title,
        description: video.description ?? '',
        coverUrl: video.coverUrl ?? '',
        playUrl: video.playUrl,
        categoryId: video.categoryId.toString(),
        shouldSync: false,
      })
      setPreviewImage(video.coverUrl ?? null)
    } else {
      resetForm()
    }
  }, [video, isOpen])

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      coverUrl: '',
      playUrl: '',
      categoryId: '',
      shouldSync: false,
    })
    setPreviewImage(null)
    setImageUploadType('remote')
  }

  const handleImageUpload = async (file: File) => {
    try {
      const result = await processAndUploadImage(
        file,
        uploadCoverMutation.mutateAsync,
      )
      setFormData((prev) => ({ ...prev, coverUrl: result.coverUrl })) // Extract coverUrl
      setPreviewImage(result.coverUrl) // Extract coverUrl
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
        description: formData.description,
        coverUrl: formData.coverUrl,
        playUrl: formData.playUrl,
        categoryId: parseInt(formData.categoryId),
      }
      if (video) {
        await updateVideoMutation.mutateAsync({ id: video.id, ...data })
        toast.success('视频更新成功')
      } else {
        await createVideoMutation.mutateAsync(data)
        toast.success('视频创建成功')
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('保存视频失败:', error)
      toast.error('保存视频失败，请重试')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader>{video ? '编辑视频' : '创建新视频'}</ModalHeader>
        <ModalBody>
          <Input
            label="标题"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <Textarea
            label="描述"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <Input
            label="播放链接"
            value={formData.playUrl}
            onChange={(e) =>
              setFormData({ ...formData, playUrl: e.target.value })
            }
            required
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
                if (file) void handleImageUpload(file)
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
                height={112}
              />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              isSelected={formData.shouldSync}
              onValueChange={(checked) =>
                setFormData((prev) => ({ ...prev, shouldSync: checked }))
              }
            />
            <span>同步图片到本地</span>
          </div>
          <Select
            label="分类"
            selectedKeys={[formData.categoryId]}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string
              setFormData((prev) => ({ ...prev, categoryId: selectedKey }))
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
          <Button color="primary" onPress={() => void handleSubmit()}>
            {video ? '更新' : '创建'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
