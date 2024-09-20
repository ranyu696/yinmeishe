import { Button, Input, Select, SelectItem } from '@nextui-org/react'
import { type FriendLink, FriendLinkPosition } from '@prisma/client'
import React, { useState } from 'react'

interface FriendLinkFormProps {
  initialData?: Partial<FriendLink>
  onSubmit: (data: Partial<FriendLink>) => void
  onCancel: () => void
}

export const FriendLinkForm: React.FC<FriendLinkFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<FriendLink>>(
    initialData ?? {},
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
        isRequired
      />
      <Input
        name="logoUrl"
        label="Logo URL"
        value={formData.logoUrl ?? ''}
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
        label="位置"
        placeholder="选择位置"
        selectedKeys={formData.position ? [formData.position] : []}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            position: e.target.value as FriendLinkPosition,
          }))
        }
      >
        <SelectItem key={FriendLinkPosition.TOP} value={FriendLinkPosition.TOP}>
          顶部
        </SelectItem>
        <SelectItem
          key={FriendLinkPosition.BOTTOM}
          value={FriendLinkPosition.BOTTOM}
        >
          底部
        </SelectItem>
      </Select>
      <div className="flex gap-2">
        <Button color="primary" type="submit">
          提交
        </Button>
        <Button color="danger" variant="flat" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  )
}
