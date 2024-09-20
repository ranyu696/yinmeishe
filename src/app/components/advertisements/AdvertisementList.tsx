// src/components/advertisements/AdvertisementList.tsx
'use client'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  User,
} from '@nextui-org/react'
import { type Advertisement } from '@prisma/client'
import React from 'react'

interface AdvertisementListProps {
  advertisements: Advertisement[]
  onEdit: (ad: Advertisement) => void
  onDelete: (id: number) => void
}

export const AdvertisementList: React.FC<AdvertisementListProps> = ({
  advertisements,
  onEdit,
  onDelete,
}) => {
  const columns = [
    { key: 'title', label: '标题' },
    { key: 'imagePath', label: '图片路径' },
    { key: 'linkUrl', label: '链接URL' },
    { key: 'startDate', label: '开始日期' },
    { key: 'endDate', label: '结束日期' },
    { key: 'order', label: '顺序' },
    { key: 'actions', label: '操作' },
  ]

  const renderCell = (ad: Advertisement, columnKey: React.Key) => {
    switch (columnKey) {
      case 'title':
        return <User name={ad.title} avatarProps={{ src: ad.imagePath }} />
      case 'imagePath':
        return (
          <Tooltip content={ad.imagePath}>
            <Button size="sm">查看图片</Button>
          </Tooltip>
        )
      case 'linkUrl':
        return ad.linkUrl ? (
          <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer">
            {ad.linkUrl}
          </a>
        ) : (
          'N/A'
        )
      case 'startDate':
        return ad.startDate?.toLocaleDateString() || 'N/A'
      case 'endDate':
        return ad.endDate?.toLocaleDateString() || 'N/A'
      case 'order':
        return ad.order
      case 'actions':
        return (
          <div className="flex gap-2">
            <Button size="sm" onPress={() => onEdit(ad)}>
              编辑
            </Button>
            <Button size="sm" color="danger" onPress={() => onDelete(ad.id)}>
              删除
            </Button>
          </div>
        )
      default:
        return ad[columnKey as keyof Advertisement]?.toString() || 'N/A'
    }
  }

  return (
    <Table aria-label="广告列表">
      <TableHeader>
        {columns.map((column) => (
          <TableColumn key={column.key}>{column.label}</TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {advertisements.map((ad) => (
          <TableRow key={ad.id}>
            {columns.map((column) => (
              <TableCell key={`${ad.id}-${column.key}`}>
                {renderCell(ad, column.key)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
