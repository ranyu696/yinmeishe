'use client'

import { CalendarDate } from '@internationalized/date'
import {
  Button,
  DatePicker,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
} from '@nextui-org/react'
import { type Advertisement, AdvertisementType } from '@prisma/client'
import React, { useState } from 'react'

interface AdvertisementFormProps {
  initialData: Partial<Advertisement>
  onSubmit: (data: Partial<Advertisement>) => void
  onCancel: () => void
}

export const AdvertisementForm: React.FC<AdvertisementFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Advertisement>>(
    initialData ?? {},
  )

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' ? Number(value) : value,
    }))
  }

  const handleTypeChange = (key: React.Key) => {
    setFormData((prev) => ({ ...prev, type: key as AdvertisementType }))
  }

  const handleDateChange =
    (name: 'startDate' | 'endDate') => (date: CalendarDate | null) => {
      setFormData((prev) => ({
        ...prev,
        [name]: date
          ? new Date(date.year, date.month - 1, date.day)
          : undefined,
      }))
    }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="title"
        label="标题"
        value={formData.title ?? ''}
        onChange={handleChange}
      />
      <Input
        name="imagePath"
        label="图片路径"
        value={formData.imagePath ?? ''}
        onChange={handleChange}
        required
      />
      <Input
        name="linkUrl"
        label="链接URL"
        value={formData.linkUrl ?? ''}
        onChange={handleChange}
      />
      <DatePicker
        label="开始日期"
        value={
          formData.startDate
            ? new CalendarDate(
                formData.startDate.getFullYear(),
                formData.startDate.getMonth() + 1,
                formData.startDate.getDate(),
              )
            : undefined
        }
        onChange={handleDateChange('startDate')}
      />
      <DatePicker
        label="结束日期"
        value={
          formData.endDate
            ? new CalendarDate(
                formData.endDate.getFullYear(),
                formData.endDate.getMonth() + 1,
                formData.endDate.getDate(),
              )
            : undefined
        }
        onChange={handleDateChange('endDate')}
      />
      <Input
        name="order"
        label="顺序"
        type="number"
        value={formData.order?.toString() ?? ''}
        onChange={handleChange}
        required
      />
      <Dropdown>
        <DropdownTrigger>
          <Button variant="flat">{formData.type ?? '选择类型'}</Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="广告类型选择"
          onAction={handleTypeChange}
          selectionMode="single"
          selectedKeys={formData.type ? [formData.type] : []}
        >
          <DropdownItem key={AdvertisementType.BANNER}>横幅</DropdownItem>
          <DropdownItem key={AdvertisementType.ICON}>图标</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <div className="flex gap-2">
        <Button type="submit">提交</Button>
        <Button onClick={onCancel} color="danger">
          取消
        </Button>
      </div>
    </form>
  )
}
