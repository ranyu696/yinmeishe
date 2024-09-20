import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Textarea,
} from '@nextui-org/react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '~/trpc/react'

interface CreateImageSetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateImageSetModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateImageSetModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = api.category.getByType.useQuery({ type: 'Picture' })

  const createImageSet = api.picture.create.useMutation({
    onSuccess: () => {
      onSuccess()
      setTitle('')
      setDescription('')
      setCategoryId('')
      toast.success('图集创建成功!')
    },
    onError: (error) => {
      toast.error(`创建图集失败: ${error.message}`)
    },
  })

  const handleSubmit = () => {
    if (!categoryId) {
      toast.warn('请选择一个分类')
      return
    }
    if (!title.trim()) {
      toast.warn('请输入标题')
      return
    }
    createImageSet.mutate({
      title,
      description,
      categoryId: parseInt(categoryId),
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeButton
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">创建新图集</ModalHeader>
        <ModalBody>
          <Input
            label="标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4"
            required
            isClearable
            placeholder="输入图集标题"
          />
          <Textarea
            label="描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-4"
            placeholder="输入图集描述（可选）"
          />
          <Select
            label="选择分类"
            placeholder="选择一个分类"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mb-4"
          >
            {isCategoriesLoading ? (
              <SelectItem key="loading" value="loading">
                <Spinner size="sm" /> 加载中...
              </SelectItem>
            ) : isCategoriesError ? (
              <SelectItem key="error" value="error">
                加载分类失败
              </SelectItem>
            ) : categories && categories.length > 0 ? (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem key="empty" value="empty">
                没有可用的分类
              </SelectItem>
            )}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={
              !categoryId || !title.trim() || createImageSet.isPending
            }
            isLoading={createImageSet.isPending}
          >
            {createImageSet.isPending ? '创建中...' : '创建'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
