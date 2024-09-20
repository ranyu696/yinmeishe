'use client'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { type Tag } from '@prisma/client'
import React from 'react'

interface TagListProps {
  tags: Tag[]
  onEdit: (tag: Tag) => void
  onDelete: (id: number) => void
}

export const TagList: React.FC<TagListProps> = ({ tags, onEdit, onDelete }) => {
  return (
    <Table aria-label="标签列表">
      <TableHeader>
        <TableColumn>名称</TableColumn>
        <TableColumn>URL</TableColumn>
        <TableColumn>顺序</TableColumn>
        <TableColumn>位置</TableColumn>
        <TableColumn>操作</TableColumn>
      </TableHeader>
      <TableBody>
        {tags.map((tag) => (
          <TableRow key={tag.id}>
            <TableCell>{tag.name}</TableCell>
            <TableCell>{tag.url}</TableCell>
            <TableCell>{tag.order}</TableCell>
            <TableCell>{tag.position}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" color="primary" onPress={() => onEdit(tag)}>
                  编辑
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  onPress={() => onDelete(tag.id)}
                >
                  删除
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
