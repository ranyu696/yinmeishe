'use client'
import { Button, Input, Select, SelectItem } from '@nextui-org/react'
import { type Category, CategoryType } from '@prisma/client'
import { useState } from 'react'
import { toast } from 'react-toastify'

type CategoryInput = Omit<Category, 'id'> & { id?: number }

interface CategoryFormProps {
  initialData?: Partial<CategoryInput>
  onSubmit: (category: CategoryInput) => void
  selectedType: CategoryType
}

export default function CategoryForm({
  initialData = {},
  onSubmit,
  selectedType,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryInput>({
    name: '',
    type: selectedType,
    ...initialData,
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('分类名称不能为空')
      return
    }
    onSubmit(formData)
  }

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { name: string; value: CategoryType } },
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="名称"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Select
        label="类型"
        name="type"
        selectedKeys={[formData.type]}
        onChange={(e) =>
          handleChange({
            target: { name: 'type', value: e.target.value as CategoryType },
          })
        }
        required
      >
        {Object.values(CategoryType).map((type) => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </Select>
      <Button type="submit" color="primary">
        {initialData.id ? '更新' : '创建'} 分类
      </Button>
    </form>
  )
}
