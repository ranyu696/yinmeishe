'use client'

import {
  Button,
  Card,
  CardBody,
  Image,
  Input,
  Pagination,
  Select,
  SelectItem,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@nextui-org/react'
import { type Category, type Picture, type PictureImage } from '@prisma/client'
import { Edit, Plus, Search, Trash2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import CreateImageSetModal from '~/app/components/picture/CreateImageSetModal'
import EditImageSetModal from '~/app/components/picture/EditImageSetModal'
import UploadImageModal from '~/app/components/picture/UploadImageModal'
import { api } from '~/trpc/react'

interface ImageWithCategory extends Picture {
  category: Category
  images: PictureImage[]
}

export default function ImageSetsPage() {
  const [imageSets, setImageSets] = useState<ImageWithCategory[]>([])
  const [selectedImageSet, setSelectedImageSet] =
    useState<ImageWithCategory | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure()
  const {
    isOpen: isUploadOpen,
    onOpen: onUploadOpen,
    onClose: onUploadClose,
  } = useDisclosure()
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure()

  const {
    data: imageSetsData,
    refetch,
    isLoading,
  } = api.picture.getAll.useQuery({
    page,
    perPage: 20,
    search: searchTerm,
    categoryId,
    isActive,
  })

  const updateImageSet = api.picture.update.useMutation({
    onSuccess: () => {
      refetch().catch(console.error)
      toast.success('图集已更新')
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`)
    },
  })

  const deleteImageSet = api.picture.delete.useMutation({
    onSuccess: () => {
      refetch().catch(console.error)
      toast.success('图集已删除')
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`)
    },
  })

  const { data: categories } = api.category.getByType.useQuery({
    type: 'Picture',
  })

  useEffect(() => {
    if (imageSetsData) {
      setImageSets(imageSetsData.pictures as ImageWithCategory[])
      setTotalPages(imageSetsData.pages)
    }
  }, [imageSetsData])

  const handleCreateSuccess = async () => {
    try {
      await refetch()
      onCreateClose()
    } catch (error) {
      console.error('刷新数据失败:', error)
      toast.warn('刷新数据失败')
    }
  }

  const handleUploadSuccess = async () => {
    try {
      await refetch()
      onUploadClose()
    } catch (error) {
      console.error('刷新数据失败:', error)
      toast.warn('刷新数据失败')
    }
  }

  const handleEditSuccess = async () => {
    try {
      await refetch()
      onEditClose()
    } catch (error) {
      console.error('刷新数据失败:', error)
      toast.warn('刷新数据失败')
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleCategoryFilter = async (value: string) => {
    setCategoryId(value ? Number(value) : undefined)
    setPage(1)
    try {
      await refetch()
    } catch (error) {
      console.error('刷新数据失败:', error)
      toast.warn('刷新数据失败')
    }
  }

  const handleStatusFilter = async (value: string) => {
    setIsActive(value === '' ? undefined : value === 'true')
    setPage(1)
    try {
      await refetch()
    } catch (error) {
      console.error('刷新数据失败:', error)
      toast.warn('刷新数据失败')
    }
  }

  const handleStatusChange = async (id: number, isActive: boolean) => {
    try {
      await updateImageSet.mutateAsync({ id, isActive })
      await refetch()
    } catch (error) {
      console.error('更新状态失败:', error)
      toast.error('更新状态失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这个图集吗？')) {
      try {
        await deleteImageSet.mutateAsync({ id })
      } catch (error) {
        console.error('删除失败:', error)
        toast.error('删除失败')
      }
    }
  }

  const handleBatchOperation = async (
    operation: 'activate' | 'deactivate' | 'delete',
  ) => {
    const selectedIds = Array.from(selectedKeys).map(Number)
    if (selectedIds.length === 0) {
      toast.warn('请先选择图集')
      return
    }

    switch (operation) {
      case 'activate':
      case 'deactivate':
        const isActive = operation === 'activate'
        try {
          await Promise.all(
            selectedIds.map((id) =>
              updateImageSet.mutateAsync({ id, isActive }),
            ),
          )
          await refetch()
        } catch (error) {
          console.error('批量操作失败:', error)
        }
        break
      case 'delete':
        if (
          window.confirm(`确定要删除选中的 ${selectedIds.length} 个图集吗？`)
        ) {
          try {
            await Promise.all(
              selectedIds.map((id) => deleteImageSet.mutateAsync({ id })),
            )
            await refetch()
          } catch (error) {
            console.error('批量删除失败:', error)
          }
        }
        break
    }
  }

  return (
    <div className="mx-auto my-14 flex w-full max-w-[95rem] flex-col gap-4 lg:px-6">
      <Card className="mb-4">
        <CardBody>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">图集管理</h1>
            <Button
              onPress={onCreateOpen}
              color="primary"
              startContent={<Plus size={18} />}
            >
              创建图集
            </Button>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <Input
              placeholder="搜索图集..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              startContent={<Search size={18} />}
              className="max-w-xs"
            />
            <Select
              label="分类"
              placeholder="选择分类"
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="max-w-xs"
            >
              {(categories ?? []).map((category) => (
                <SelectItem
                  key={category.id.toString()}
                  value={category.id.toString()}
                >
                  {category.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="状态"
              placeholder="选择状态"
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="max-w-xs"
            >
              <SelectItem key="all" value="">
                全部状态
              </SelectItem>
              <SelectItem key="active" value="true">
                上架
              </SelectItem>
              <SelectItem key="inactive" value="false">
                下架
              </SelectItem>
            </Select>
          </div>
          <div className="flex space-x-2">
            <Button
              color="success"
              onPress={() => handleBatchOperation('activate')}
            >
              批量上架
            </Button>
            <Button
              color="warning"
              onPress={() => handleBatchOperation('deactivate')}
            >
              批量下架
            </Button>
            <Button
              color="danger"
              onPress={() => handleBatchOperation('delete')}
            >
              批量删除
            </Button>
          </div>
        </CardBody>
      </Card>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <Table
          aria-label="图集列表"
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                page={page}
                total={totalPages}
                onChange={(page) => {
                  setPage(page)
                  refetch().catch(console.error)
                }}
              />
            </div>
          }
          className="mb-4"
        >
          <TableHeader>
            <TableColumn>封面</TableColumn>
            <TableColumn>标题</TableColumn>
            <TableColumn>描述</TableColumn>
            <TableColumn>分类</TableColumn>
            <TableColumn>图片数量</TableColumn>
            <TableColumn>状态</TableColumn>
            <TableColumn>操作</TableColumn>
          </TableHeader>
          <TableBody>
            {imageSets.map((imageSet) => (
              <TableRow key={imageSet.id}>
                <TableCell>
                  {imageSet.coverUrl ? (
                    <Image
                      src={imageSet.coverUrl}
                      alt={imageSet.title}
                      width={72}
                      height={128}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-[128px] w-[72px] items-center justify-center rounded bg-gray-200">
                      无封面
                    </div>
                  )}
                </TableCell>
                <TableCell>{imageSet.title}</TableCell>
                <TableCell>{imageSet.description}</TableCell>
                <TableCell>{imageSet.category.name}</TableCell>
                <TableCell>{imageSet.images.length}</TableCell>
                <TableCell>
                  <Switch
                    isSelected={imageSet.isActive}
                    onValueChange={(isActive) =>
                      handleStatusChange(imageSet.id, isActive)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onPress={() => {
                        setSelectedImageSet(imageSet)
                        onUploadOpen()
                      }}
                      startContent={<Upload size={16} />}
                    >
                      上传
                    </Button>
                    <Button
                      size="sm"
                      onPress={() => {
                        setSelectedImageSet(imageSet)
                        onEditOpen()
                      }}
                      startContent={<Edit size={16} />}
                    >
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      onPress={() => handleDelete(imageSet.id)}
                      startContent={<Trash2 size={16} />}
                    >
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <CreateImageSetModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onSuccess={handleCreateSuccess}
      />
      {selectedImageSet && (
        <UploadImageModal
          isOpen={isUploadOpen}
          onClose={onUploadClose}
          onSuccess={handleUploadSuccess}
          imageSetId={selectedImageSet.id}
        />
      )}
      {selectedImageSet && (
        <EditImageSetModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          onSuccess={handleEditSuccess}
          imageSetId={selectedImageSet.id}
        />
      )}
    </div>
  )
}
