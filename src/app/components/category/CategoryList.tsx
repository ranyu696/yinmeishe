'use client'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  useDisclosure,
} from '@nextui-org/react'
import { type Category, CategoryType } from '@prisma/client'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '~/trpc/react'
import DeleteConfirmModal from '../shared/DeleteConfirmModal'
import CategoryForm from './CategoryForm'

type CategoryInput = Omit<Category, 'id'> & { id?: number }

export default function CategoryList({
  initialCategories,
}: {
  initialCategories: Category[]
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [selectedType, setSelectedType] = useState<CategoryType>(
    CategoryType.Video,
  )
  const deleteModalDisclosure = useDisclosure()
  const formModalDisclosure = useDisclosure()
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)
  const [editingCategory, setEditingCategory] = useState<CategoryInput | null>(
    null,
  )

  const deleteCategoryMutation = api.category.delete.useMutation({
    onSuccess: () => {
      setCategories(categories.filter((c) => c.id !== categoryToDelete))
      deleteModalDisclosure.onClose()
      toast.success('分类删除成功')
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`)
    },
  })

  const updateCategoryMutation = api.category.update.useMutation({
    onSuccess: (updatedCategory) => {
      setCategories(
        categories.map((c) =>
          c.id === updatedCategory.id ? updatedCategory : c,
        ),
      )
      setEditingCategory(null)
      formModalDisclosure.onClose()
      toast.success('分类更新成功')
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`)
    },
  })

  const createCategoryMutation = api.category.create.useMutation({
    onSuccess: (newCategory) => {
      setCategories([...categories, newCategory])
      setEditingCategory(null)
      formModalDisclosure.onClose()
      toast.success('分类创建成功')
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`)
    },
  })

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category.id)
    deleteModalDisclosure.onOpen()
  }

  const confirmDelete = () => {
    if (categoryToDelete !== null) {
      deleteCategoryMutation.mutate(categoryToDelete)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      type: category.type,
    })
    formModalDisclosure.onOpen()
  }

  const handleSubmit = (category: CategoryInput) => {
    if (category.id) {
      updateCategoryMutation.mutate(category as Category)
    } else {
      createCategoryMutation.mutate(category)
    }
  }

  const filteredCategories = categories.filter(
    (category) => category.type === selectedType,
  )
  const handleAddCategory = () => {
    setEditingCategory(null)
    formModalDisclosure.onOpen()
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Tabs
          aria-label="Category types"
          selectedKey={selectedType}
          onSelectionChange={(key) => setSelectedType(key as CategoryType)}
        >
          {Object.values(CategoryType).map((type) => (
            <Tab key={type} title={type} />
          ))}
        </Tabs>
        <Button color="primary" onPress={handleAddCategory}>
          <Plus size={20} />
          添加分类
        </Button>
      </div>

      <Table aria-label="Category list table">
        <TableHeader>
          <TableColumn>分类ID</TableColumn>
          <TableColumn>名称</TableColumn>
          <TableColumn>类型</TableColumn>
          <TableColumn>操作</TableColumn>
        </TableHeader>
        <TableBody>
          {filteredCategories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.id}</TableCell>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.type}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    color="primary"
                    aria-label="Edit"
                    onPress={() => handleEdit(category)}
                  >
                    <Edit size={20} />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    aria-label="Delete"
                    onPress={() => handleDelete(category)}
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        isOpen={formModalDisclosure.isOpen}
        onOpenChange={formModalDisclosure.onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editingCategory ? '编辑分类' : '添加分类'}
              </ModalHeader>
              <ModalBody>
                <CategoryForm
                  onSubmit={(category) => {
                    handleSubmit(category)
                    onClose()
                  }}
                  initialData={editingCategory ?? {}}
                  selectedType={selectedType}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModalDisclosure.isOpen}
        onClose={deleteModalDisclosure.onClose}
        onConfirm={confirmDelete}
        title="删除分类"
        content="您确定要删除该分类吗？此操作无法撤消。"
      />
    </>
  )
}
