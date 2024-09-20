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
import { type Tag, TagPosition } from '@prisma/client'
import React, { useState } from 'react'
import { api } from '~/trpc/react'
import { TagForm } from './TagForm'
import { TagList } from './TagList'

export const TagManagement: React.FC = () => {
  const [selectedPosition, setSelectedPosition] = useState<TagPosition>(
    TagPosition.TOP,
  )
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  const { data: tags, refetch } = api.tag.getAll.useQuery()
  const createMutation = api.tag.create.useMutation()
  const updateMutation = api.tag.update.useMutation()
  const deleteMutation = api.tag.delete.useMutation()

  const filteredTags =
    tags?.filter((tag) => tag.position === selectedPosition) ?? []

  const handleAddEdit = async (tagData: Partial<Tag>) => {
    try {
      const preparedData = {
        ...tagData,
        order: tagData.order ? Number(tagData.order) : undefined,
      }

      if (editingTag) {
        await updateMutation.mutateAsync({
          ...preparedData,
          id: editingTag.id,
        } as Tag)
      } else {
        await createMutation.mutateAsync(preparedData as Tag)
      }
      onOpenChange()
      setEditingTag(null)
      await refetch()
    } catch (error) {
      console.error('添加/编辑标签时出错:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
      await refetch()
    } catch (error) {
      console.error('删除标签时出错:', error)
    }
  }

  const handleOpenModal = (tag?: Tag) => {
    setEditingTag(tag ?? null)
    onOpen()
  }

  return (
    <div className="container mx-auto p-6">
      <Tabs
        selectedKey={selectedPosition}
        onSelectionChange={(key) => setSelectedPosition(key as TagPosition)}
        className="mb-4"
      >
        <Tab key={TagPosition.TOP} title="顶部标签" />
        <Tab key={TagPosition.BOTTOM} title="底部标签" />
      </Tabs>

      <div className="mb-4">
        <Button onPress={() => handleOpenModal()} color="primary">
          添加标签
        </Button>
      </div>

      <TagList
        tags={filteredTags}
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
                {editingTag ? '编辑标签' : '添加标签'}
              </ModalHeader>
              <ModalBody>
                <TagForm
                  initialData={editingTag ?? { position: selectedPosition }}
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
