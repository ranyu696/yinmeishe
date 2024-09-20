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
import { type Advertisement, AdvertisementType } from '@prisma/client'
import React, { useState } from 'react'
import { AdvertisementForm } from '~/app/components/advertisements/AdvertisementForm'
import { AdvertisementList } from '~/app/components/advertisements/AdvertisementList'
import { api } from '~/trpc/react'

const AdsPage: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [selectedType, setSelectedType] = useState<AdvertisementType>(
    AdvertisementType.BANNER,
  )
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)

  const { data: advertisements, refetch } = api.advertisement.getAll.useQuery()
  const createMutation = api.advertisement.create.useMutation()
  const updateMutation = api.advertisement.update.useMutation()
  const deleteMutation = api.advertisement.delete.useMutation()

  const filteredAds =
    advertisements?.filter((ad) => ad.type === selectedType) ?? []

  const handleAddEdit = async (adData: Partial<Advertisement>) => {
    try {
      const formattedData = {
        ...adData,
        order:
          typeof adData.order === 'string'
            ? parseInt(adData.order, 10)
            : adData.order,
      }

      if (editingAd) {
        await updateMutation.mutateAsync({
          ...formattedData,
          id: editingAd.id,
        } as Advertisement)
      } else {
        await createMutation.mutateAsync(formattedData as Advertisement)
      }

      await refetch() // 确保 refetch 的 Promise 被处理
    } catch (error) {
      console.error('添加/编辑广告时出错：', error)
    } finally {
      onOpenChange() // 无论成功与否都会执行
      setEditingAd(null) // 无论成功与否都会执行
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id)
      await refetch() // 确保 refetch 的 Promise 被处理
    } catch (error) {
      console.error('删除广告时出错：', error)
    }
  }

  const handleOpenModal = () => {
    setEditingAd(null)
    onOpen()
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <Tabs
          selectedKey={selectedType}
          onSelectionChange={(key) => setSelectedType(key as AdvertisementType)}
        >
          <Tab key={AdvertisementType.BANNER} title="横幅广告" />
          <Tab key={AdvertisementType.ICON} title="图标广告" />
        </Tabs>
        <Button onPress={handleOpenModal} color="primary">
          添加广告
        </Button>
      </div>

      <AdvertisementList
        advertisements={filteredAds}
        onEdit={(ad) => {
          setEditingAd(ad)
          onOpen()
        }}
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
                {editingAd ? '编辑广告' : '添加广告'}
              </ModalHeader>
              <ModalBody>
                <AdvertisementForm
                  initialData={editingAd ?? { type: selectedType }}
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

export default AdsPage
