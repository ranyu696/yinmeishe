'use client'

import {
  Button,
  Switch,
  Tab,
  Tabs,
  Tooltip,
  useDisclosure,
} from '@nextui-org/react'
import { type Category, CategoryType } from '@prisma/client'
import { ChevronDown, ChevronRight, Edit, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { CategoryForm } from '~/app/components/category/CategoryForm'
import DeleteConfirmModal from '~/app/components/shared/DeleteConfirmModal'
import { api } from '~/trpc/react'

export default function CategoriesPage() {
  const [selectedType, setSelectedType] = useState<CategoryType>(
    CategoryType.Video,
  )
  const deleteModalDisclosure = useDisclosure()
  const formModalDisclosure = useDisclosure()
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)
  const [editingCategory, setEditingCategory] =
    useState<Partial<Category> | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set(),
  )

  const { data: categories = [], refetch } = api.category.getAll.useQuery()

  const deleteCategoryMutation = api.category.delete.useMutation({
    onSuccess: () => {
      refetch().catch(console.error)
      deleteModalDisclosure.onClose()
      toast.success('分类删除成功')
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`)
    },
  })

  const updateCategoryMutation = api.category.update.useMutation({
    onSuccess: () => {
      refetch().catch(console.error)
      setEditingCategory(null)
      formModalDisclosure.onClose()
      toast.success('分类更新成功')
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`)
    },
  })

  const createCategoryMutation = api.category.create.useMutation({
    onSuccess: () => {
      refetch().catch(console.error)
      setEditingCategory(null)
      formModalDisclosure.onClose()
      toast.success('分类创建成功')
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`)
    },
  })

  const toggleActiveMutation = api.category.toggleActive.useMutation({
    onSuccess: () => {
      refetch().catch(console.error)
      toast.success('分类状态更新成功')
    },
    onError: (error) => {
      toast.error(`状态更新失败: ${error.message}`)
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
    setEditingCategory(category)
    formModalDisclosure.onOpen()
  }

  const handleSubmit = (category: Partial<Category>) => {
    if (category.id) {
      updateCategoryMutation.mutate(category as Category)
    } else {
      createCategoryMutation.mutate(category as Omit<Category, 'id'>)
    }
  }

  const toggleExpand = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const toggleActive = (category: Category) => {
    toggleActiveMutation.mutate({
      id: category.id,
      isActive: !category.isActive,
    })
  }

  const hierarchicalCategories = useMemo(() => {
    const buildHierarchy = (
      parentId: number | null,
      level: number,
    ): (Category & { level: number })[] => {
      return categories
        .filter(
          (category) =>
            category.parentId === parentId && category.type === selectedType,
        )
        .sort((a, b) => a.order - b.order)
        .flatMap((category) => [
          { ...category, level },
          ...buildHierarchy(category.id, level + 1),
        ])
    }
    return buildHierarchy(null, 0)
  }, [categories, selectedType])

  const renderCategoryItem = (category: Category & { level: number }) => {
    const hasChildren = categories.some((c) => c.parentId === category.id)
    const isExpanded = expandedCategories.has(category.id)

    return (
      <div key={category.id} className="mb-2">
        <div
          className={`flex items-center ${category.level > 0 ? 'ml-6 border-l border-gray-300 pl-4' : ''}`}
        >
          {hasChildren && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => toggleExpand(category.id)}
            >
              {isExpanded ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </Button>
          )}
          <span className="ml-2 grow">{category.name}</span>
          <span className="mr-4">序号: {category.order}</span>
          <Switch
            isSelected={category.isActive}
            onValueChange={() => toggleActive(category)}
          />
          <div className="ml-4 flex gap-2">
            <Tooltip content="编辑分类">
              <Button
                isIconOnly
                color="primary"
                aria-label="Edit"
                onPress={() => handleEdit(category)}
              >
                <Edit size={20} />
              </Button>
            </Tooltip>
            <Tooltip content="删除分类">
              <Button
                isIconOnly
                color="danger"
                aria-label="Delete"
                onPress={() => handleDelete(category)}
              >
                <Trash2 size={20} />
              </Button>
            </Tooltip>
            <Tooltip content="添加子分类">
              <Button
                isIconOnly
                color="success"
                aria-label="Add Subcategory"
                onPress={() => {
                  setEditingCategory({
                    type: category.type,
                    parentId: category.id,
                  })
                  formModalDisclosure.onOpen()
                }}
              >
                <Plus size={20} />
              </Button>
            </Tooltip>
          </div>
        </div>
        {isExpanded &&
          hierarchicalCategories
            .filter((c) => c.parentId === category.id)
            .map(renderCategoryItem)}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">分类管理</h1>

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
        <Button
          color="primary"
          onPress={() => {
            setEditingCategory({ type: selectedType, parentId: null })
            formModalDisclosure.onOpen()
          }}
        >
          <Plus size={20} />
          添加顶级分类
        </Button>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        {hierarchicalCategories
          .filter((category) => category.parentId === null)
          .map(renderCategoryItem)}
      </div>

      {formModalDisclosure.isOpen && (
        <CategoryForm
          onSubmit={handleSubmit}
          initialData={editingCategory ?? {}}
          categories={categories}
          isEditing={!!editingCategory?.id}
          onClose={formModalDisclosure.onClose}
        />
      )}

      <DeleteConfirmModal
        isOpen={deleteModalDisclosure.isOpen}
        onClose={deleteModalDisclosure.onClose}
        onConfirm={confirmDelete}
        title="删除分类"
        content="您确定要删除该分类吗？此操作将同时删除所有子分类，且无法撤消。"
      />
    </div>
  )
}
