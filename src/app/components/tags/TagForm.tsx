'use client'
import { Button, Input, Select, SelectItem } from '@nextui-org/react'
import { type Tag, TagPosition } from '@prisma/client'
import React, { useState } from 'react'

interface TagFormProps {
  initialData: Partial<Tag>
  onSubmit: (data: Partial<Tag>) => void
  onCancel: () => void
}

export const TagForm: React.FC<TagFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Tag>>(initialData)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' ? (value ? Number(value) : undefined) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        label="名称"
        value={formData.name ?? ''}
        onChange={handleChange}
        isRequired
      />
      <Input
        name="url"
        label="URL"
        value={formData.url ?? ''}
        onChange={handleChange}
      />
      <Input
        name="order"
        label="顺序"
        type="number"
        value={formData.order?.toString() ?? ''}
        onChange={handleChange}
        isRequired
      />
      <Select
        name="position"
        label="位置"
        selectedKeys={formData.position ? [formData.position] : []}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            position: e.target.value as TagPosition,
          }))
        }
      >
        <SelectItem key={TagPosition.TOP} value={TagPosition.TOP}>
          顶部
        </SelectItem>
        <SelectItem key={TagPosition.BOTTOM} value={TagPosition.BOTTOM}>
          底部
        </SelectItem>
      </Select>
      <div className="flex gap-2">
        <Button type="submit" color="primary">
          提交
        </Button>
        <Button onClick={onCancel} color="danger" variant="flat">
          取消
        </Button>
      </div>
    </form>
  )
}
