import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { type FriendLink } from '@prisma/client'
import React from 'react'

interface FriendLinkListProps {
  friendLinks: FriendLink[]
  onEdit: (link: FriendLink) => void
  onDelete: (id: number) => void
}

export const FriendLinkList: React.FC<FriendLinkListProps> = ({
  friendLinks,
  onEdit,
  onDelete,
}) => {
  return (
    <Table aria-label="友情链接列表">
      <TableHeader>
        <TableColumn>名称</TableColumn>
        <TableColumn>URL</TableColumn>
        <TableColumn>Logo URL</TableColumn>
        <TableColumn>顺序</TableColumn>
        <TableColumn>操作</TableColumn>
      </TableHeader>
      <TableBody>
        {friendLinks.map((link) => (
          <TableRow key={link.id}>
            <TableCell>{link.name}</TableCell>
            <TableCell>{link.url}</TableCell>
            <TableCell>{link.logoUrl}</TableCell>
            <TableCell>{link.order}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" color="primary" onPress={() => onEdit(link)}>
                  编辑
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  onPress={() => onDelete(link.id)}
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
