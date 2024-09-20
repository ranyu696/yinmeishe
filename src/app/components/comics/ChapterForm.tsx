import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react'
import { useState } from 'react'

interface ChapterData {
  title: string
  chapterNumber: number
}

interface ChapterFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ChapterData) => void
  initialData?: ChapterData | null
}

export function ChapterForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}: ChapterFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [chapterNumber, setChapterNumber] = useState(
    initialData?.chapterNumber?.toString() ?? '',
  )

  const handleSubmit = () => {
    onSubmit({ title, chapterNumber: Number(chapterNumber) })
    setTitle('')
    setChapterNumber('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {initialData ? '编辑章节' : '添加新章节'}
        </ModalHeader>
        <ModalBody>
          <Input
            label="章节标题"
            placeholder="输入章节标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="章节序号"
            placeholder="输入章节序号"
            type="number"
            value={chapterNumber}
            onChange={(e) => setChapterNumber(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            {initialData ? '更新' : '创建'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
