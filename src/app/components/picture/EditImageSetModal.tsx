import {
  Button,
  Checkbox,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Textarea,
  Tooltip,
} from '@nextui-org/react'
import { type PictureImage } from '@prisma/client'
import { Check, Eye, Move, Trash2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from 'react-beautiful-dnd'
import { toast } from 'react-toastify'
import { api } from '~/trpc/react'

interface EditImageSetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  imageSetId: number
}

export default function EditImageSetModal({
  isOpen,
  onClose,
  onSuccess,
  imageSetId,
}: EditImageSetModalProps) {
  const {
    data: imageSet,
    isLoading,
    error,
    refetch,
  } = api.picture.getById.useQuery(imageSetId)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<PictureImage[]>([])
  const [coverUrl, setcoverUrl] = useState('')
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set())
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  useEffect(() => {
    if (imageSet) {
      setTitle(imageSet.title)
      setDescription(imageSet.description ?? '')
      setImages(imageSet.images)
      setcoverUrl(imageSet.coverUrl ?? '')
    }
  }, [imageSet])

  const updateImageSet = api.picture.update.useMutation({
    onMutate: () => {
      toast.loading('正在更新图集...')
    },
    onSuccess: () => {
      onSuccess()
      toast.success('图集更新成功！')
      void toast.promise(refetch(), {
        pending: '正在刷新数据...',
        success: '数据已更新',
        error: '刷新数据失败',
      })
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`)
    },
  })

  const updateImageOrder = api.picture.updateImageOrder.useMutation({
    onMutate: () => {
      toast.loading('正在更新图片顺序...')
    },
    onSuccess: () => {
      toast.success('图片顺序更新成功！')
      void toast.promise(refetch(), {
        pending: '正在刷新数据...',
        success: '数据已更新',
        error: '刷新数据失败',
      })
    },
    onError: (error) => {
      toast.error(`顺序更新失败: ${error.message}`)
    },
  })

  const deleteImage = api.picture.deleteImage.useMutation({
    onMutate: () => {
      toast.loading('正在删除图片...')
    },
    onSuccess: () => {
      toast.success('图片删除成功！')
      void toast.promise(refetch(), {
        pending: '正在刷新数据...',
        success: '数据已更新',
        error: '刷新数据失败',
      })
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`)
    },
  })

  const handleSubmit = () => {
    if (imageSet) {
      updateImageSet.mutate({
        id: imageSet.id,
        title,
        description,
        coverUrl,
      })
    }
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(images)
    const [reorderedItem] = items.splice(result.source.index, 1)

    if (reorderedItem) {
      items.splice(result.destination.index, 0, reorderedItem)
      setImages(items)

      updateImageOrder.mutate({
        pictureId: imageSetId,
        imageOrders: items.map((item, index) => ({
          id: item.id,
          order: index + 1,
        })),
      })
    }
  }

  const handleCoverChange = (path: string) => {
    setcoverUrl(path)
  }

  const handleImageSelect = (id: number) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleDeleteSelected = () => {
    if (window.confirm(`确定要删除选中的 ${selectedImages.size} 张图片吗？`)) {
      selectedImages.forEach((id) => {
        deleteImage.mutate({ imageId: id })
      })
      setImages((prev) => prev.filter((img) => !selectedImages.has(img.id)))
      setSelectedImages(new Set())
    }
  }

  const toggleReordering = () => {
    setIsReordering(!isReordering)
  }

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalBody>
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  if (error || !imageSet) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalBody>
            <div className="text-center text-red-500">
              加载图集数据失败。请稍后再试。
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between">
          <span>编辑图集</span>
          <div className="flex space-x-2">
            <Tooltip content={isReordering ? '完成重新排序' : '重新排序图片'}>
              <Button onClick={toggleReordering}>
                {isReordering ? <Check size={20} /> : <Move size={20} />}
              </Button>
            </Tooltip>
            <Tooltip content="上传新图片">
              <Button
                onClick={() => {
                  /* 打开上传模态框 */
                }}
              >
                <Upload size={20} />
              </Button>
            </Tooltip>
          </div>
        </ModalHeader>
        <ModalBody>
          <Input
            label="标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4"
          />
          <Textarea
            label="描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-4"
          />
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-wrap gap-4"
                >
                  {images.map((image, index) => (
                    <Draggable
                      key={image.id.toString()}
                      draggableId={image.id.toString()}
                      index={index}
                      isDragDisabled={!isReordering}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...(isReordering ? provided.dragHandleProps : {})}
                          className="relative w-1/2 rounded bg-gray-100 p-2 sm:w-1/3 md:w-1/4 lg:w-1/5"
                        >
                          <Image
                            src={image.path}
                            alt={`Image ${index}`}
                            className="h-40 w-full cursor-pointer object-cover"
                            onClick={() => setPreviewImage(image.path)}
                          />
                          <div className="absolute left-2 top-2">
                            <Checkbox
                              isSelected={selectedImages.has(image.id)}
                              onChange={() => handleImageSelect(image.id)}
                            />
                          </div>
                          <div className="absolute right-2 top-2 flex space-x-1">
                            <Tooltip content="预览">
                              <Button
                                size="sm"
                                isIconOnly
                                onPress={() => setPreviewImage(image.path)}
                              >
                                <Eye size={16} />
                              </Button>
                            </Tooltip>
                            <Tooltip content="删除">
                              <Button
                                size="sm"
                                isIconOnly
                                color="danger"
                                onPress={() =>
                                  deleteImage.mutate({ imageId: image.id })
                                }
                              >
                                <Trash2 size={16} />
                              </Button>
                            </Tooltip>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <Checkbox
                              isSelected={coverUrl === image.path}
                              onChange={() => handleCoverChange(image.path)}
                            >
                              封面
                            </Checkbox>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button
            color="danger"
            onPress={handleDeleteSelected}
            isDisabled={selectedImages.size === 0}
          >
            删除选中 ({selectedImages.size})
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
      {previewImage && (
        <Modal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          size="xl"
        >
          <ModalContent>
            <ModalBody>
              <Image src={previewImage} alt="Preview" className="w-full" />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onPress={() => setPreviewImage(null)}>
                关闭
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Modal>
  )
}
