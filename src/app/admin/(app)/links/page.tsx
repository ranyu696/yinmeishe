'use client'
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tab,
  Tabs,
  useDisclosure,
} from '@nextui-org/react'
import { type FriendLink, FriendLinkPosition } from '@prisma/client'
import React, { useState } from 'react'
import { FriendLinkForm } from '~/app/components/friendLinks/FriendLinkForm'
import { FriendLinkList } from '~/app/components/friendLinks/FriendLinkList'
import { api } from '~/trpc/react'

const FriendLinkPage: React.FC = () => {
  const [selectedPosition, setSelectedPosition] = useState<FriendLinkPosition>(
    FriendLinkPosition.TOP,
  )
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [editingLink, setEditingLink] = useState<FriendLink | null>(null)

  const { data: friendLinks, refetch } = api.friendLink.getAll.useQuery()
  const createMutation = api.friendLink.create.useMutation()
  const updateMutation = api.friendLink.update.useMutation()
  const deleteMutation = api.friendLink.delete.useMutation()

  const filteredLinks =
    friendLinks?.filter((link) => link.position === selectedPosition) ?? []

  const handleAddEdit = async (linkData: Partial<FriendLink>) => {
    try {
      // 预处理数据
      const preparedData = {
        ...linkData,
        order: linkData.order ? Number(linkData.order) : undefined, // 确保 order 是数字
        logoUrl: linkData.logoUrl ?? undefined, // 处理 logoUrl 可能为 null 的情况
      }

      if (editingLink) {
        await updateMutation.mutateAsync({
          ...preparedData,
          id: editingLink.id,
        } as FriendLink)
      } else {
        await createMutation.mutateAsync(preparedData as FriendLink)
      }
      onOpenChange()
      setEditingLink(null)
      await refetch()
    } catch (error) {
      console.error('添加/编辑好友链接时出错:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
      await refetch()
    } catch (error) {
      console.error('删除好友链接时出错：', error)
    }
  }

  const handleOpenModal = (link?: FriendLink) => {
    setEditingLink(link ?? null)
    onOpen()
  }

  return (
    <div className="container mx-auto p-6">
      <Tabs
        selectedKey={selectedPosition}
        onSelectionChange={(key) =>
          setSelectedPosition(key as FriendLinkPosition)
        }
        className="mb-4"
      >
        <Tab key={FriendLinkPosition.TOP} title="顶部友链" />
        <Tab key={FriendLinkPosition.BOTTOM} title="底部友链" />
      </Tabs>

      <div className="mb-4">
        <Button onPress={() => handleOpenModal()} color="primary">
          添加友链
        </Button>
      </div>

      <FriendLinkList
        friendLinks={filteredLinks}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {editingLink ? '编辑友链' : '添加友链'}
              </ModalHeader>
              <ModalBody>
                <FriendLinkForm
                  initialData={editingLink ?? { position: selectedPosition }}
                  onSubmit={handleAddEdit}
                  onCancel={onClose}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
export default FriendLinkPage
