'use client'
import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
} from '@nextui-org/react'
import { type Category, CategoryType } from '@prisma/client'
import React, { useMemo, useState } from 'react'
import { toast } from 'react-toastify'

type CategoryInput = Omit<Category, 'id'> & { id?: number }

interface CategoryFormProps {
  onSubmit: (category: Category) => void
  categories: Category[]
  initialData?: Partial<Omit<Category, 'id'>> & { id?: number }
  isEditing: boolean
  onClose: () => void
}

export function CategoryForm({
  onSubmit,
  categories,
  initialData,
  isEditing,
  onClose,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryInput>({
    id: initialData?.id,
    name: initialData?.name ?? '',
    type: initialData?.type ?? CategoryType.Video,
    parentId: initialData?.parentId ?? null,
    isActive: initialData?.isActive ?? true,
    order: initialData?.order ?? 0,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    url: initialData?.url ?? null, // 添加 url 字段
  })
  const [isSubcategory, setIsSubcategory] = useState(!!initialData?.parentId)

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { name: string; value: CategoryInput[keyof CategoryInput] } },
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const availableParentCategories = useMemo(() => {
    const isDescendant = (parentId: number, childId: number): boolean => {
      if (parentId === childId) return true
      const child = categories.find((c) => c.id === childId)
      if (!child) return false
      return child.parentId !== null && isDescendant(parentId, child.parentId)
    }

    return categories.filter((category) => {
      if (category.type !== formData.type) return false
      if (isEditing && formData.id !== undefined) {
        return (
          category.id !== formData.id && !isDescendant(category.id, formData.id)
        )
      }
      return true
    })
  }, [categories, formData.id, formData.type, isEditing])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('分类名称不能为空')
      return
    }
    onSubmit(formData as Category)
    onClose()
  }

  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{isEditing ? '编辑分类' : '添加分类'}</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="分类名称"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Select
              label="分类类型"
              name="type"
              selectedKeys={[formData.type]}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: 'type',
                    value: e.target.value as CategoryType,
                  },
                })
              }
              isDisabled={isEditing}
            >
              {Object.values(CategoryType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </Select>
            <Checkbox
              isSelected={isSubcategory}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const checked = e.target.checked
                setIsSubcategory(checked)
                if (!checked) {
                  setFormData((prev) => ({ ...prev, parentId: null }))
                }
              }}
            >
              这是一个子分类
            </Checkbox>
            {isSubcategory && (
              <Select
                label="父分类"
                name="parentId"
                selectedKeys={
                  formData.parentId !== null
                    ? [formData.parentId.toString()]
                    : []
                }
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: 'parentId',
                      value: e.target.value ? parseInt(e.target.value) : null,
                    },
                  })
                }
              >
                {availableParentCategories.map((category) => (
                  <SelectItem
                    key={category.id.toString()}
                    value={category.id.toString()}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </Select>
            )}
            <Input
              label="排序"
              name="order"
              type="number"
              value={(formData.order ?? 0).toString()}
              onChange={handleChange}
            />
            <Input
              label="跳转URL(可选)"
              name="url"
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value={formData.url ?? ''}
              onChange={(e) => {
                const newUrl = e.target.value || null // 如果输入为空，则使用 null
                setFormData((prev) => ({ ...prev, url: newUrl }))
              }}
              placeholder="https://example.com/category"
            />
            <div className="flex items-center justify-between">
              <span>是否激活</span>
              <Switch
                isSelected={formData.isActive}
                onValueChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
            <Button type="submit" color="primary">
              {isEditing ? '更新分类' : '创建分类'}
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
