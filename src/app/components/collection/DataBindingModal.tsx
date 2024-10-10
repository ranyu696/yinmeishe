import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import type { Category } from '@prisma/client'
import { useEffect, useState } from 'react'
import { api } from '~/trpc/react'

interface ExternalCategory {
  id: number
  name: string
}

interface DataBindingModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  apiId: number
}

export function DataBindingModal({
  isOpen,
  onOpenChange,
  apiId,
}: DataBindingModalProps) {
  const [bindingMap, setBindingMap] = useState<Record<number, number>>({})

  const { data: externalCategories } = api.externalApi.getCategories.useQuery({
    apiId,
  })
  const { data: internalCategories } = api.category.getAll.useQuery()
  const { data: existingBindings } = api.categoryMapping.getByApiId.useQuery({
    apiId,
  })
  const bindCategoryMutation = api.categoryMapping.create.useMutation()

  useEffect(() => {
    if (existingBindings) {
      const newBindingMap: Record<number, number> = {}
      existingBindings.forEach((binding) => {
        newBindingMap[binding.externalId] = binding.internalId
      })
      setBindingMap(newBindingMap)
    }
  }, [existingBindings])

  const handleBindingChange = (externalId: number, internalId: number) => {
    setBindingMap((prev) => ({
      ...prev,
      [externalId]: internalId,
    }))
  }

  const handleSaveBindings = async () => {
    try {
      for (const [externalId, internalId] of Object.entries(bindingMap)) {
        await bindCategoryMutation.mutateAsync({
          externalId: parseInt(externalId),
          internalId,
          externalApiId: apiId,
        })
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving bindings:', error)
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        <ModalHeader>数据绑定</ModalHeader>
        <ModalBody>
          <Table aria-label="Category Binding Table">
            <TableHeader>
              <TableColumn>外部分类</TableColumn>
              <TableColumn>内部分类</TableColumn>
            </TableHeader>
            <TableBody>
              {(externalCategories ?? []).map(
                (extCategory: ExternalCategory) => (
                  <TableRow key={extCategory.id}>
                    <TableCell>{extCategory.name}</TableCell>
                    <TableCell>
                      <select
                        value={bindingMap[extCategory.id] ?? ''}
                        onChange={(e) =>
                          handleBindingChange(
                            extCategory.id,
                            parseInt(e.target.value),
                          )
                        }
                      >
                        <option value="">选择内部分类</option>
                        {internalCategories?.map((intCategory: Category) => (
                          <option key={intCategory.id} value={intCategory.id}>
                            {intCategory.name}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={() => void handleSaveBindings()}>
            保存绑定
          </Button>
          <Button
            color="danger"
            variant="light"
            onPress={() => onOpenChange(false)}
          >
            取消
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
