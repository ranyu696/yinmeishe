import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react'

interface ExternalApi {
  id: number
  name: string
  url: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface ExternalApiFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingApi: ExternalApi | null
  onSave: (api: ExternalApi) => void
  onChange: (api: ExternalApi) => void
}

export function ExternalApiForm({
  isOpen,
  onOpenChange,
  editingApi,
  onSave,
  onChange,
}: ExternalApiFormProps) {
  const handleSave = () => {
    if (editingApi) {
      onSave(editingApi)
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>{editingApi?.id ? '编辑API' : '添加API'}</ModalHeader>
        <ModalBody>
          <Input
            label="API名称"
            placeholder="输入API名称"
            value={editingApi?.name ?? ''}
            onChange={(e) =>
              onChange({
                ...editingApi!,
                name: e.target.value,
                isActive: editingApi?.isActive ?? true,
              })
            }
          />
          <Input
            label="API地址"
            placeholder="输入API地址"
            value={editingApi?.url ?? ''}
            onChange={(e) =>
              onChange({
                ...editingApi!,
                url: e.target.value,
                isActive: editingApi?.isActive ?? true,
              })
            }
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={handleSave}>
            保存
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
