import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@nextui-org/react'
import { type NovelChapter } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '~/trpc/react'

interface NovelChapterModalProps {
  isOpen: boolean
  onClose: () => void
  novelId: number
  chapter?: NovelChapter | null
  onSuccess: () => void
}

export const NovelChapterModal: React.FC<NovelChapterModalProps> = ({
  isOpen,
  onClose,
  novelId,
  chapter,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })

  const createChapterMutation = api.novel.createChapter.useMutation()
  const updateChapterMutation = api.novel.updateChapter.useMutation()

  useEffect(() => {
    if (chapter) {
      setFormData({
        title: chapter.title,
        content: chapter.content,
      })
    } else {
      resetForm()
    }
  }, [chapter, isOpen])

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
    })
  }

  const handleSubmit = async () => {
    try {
      if (chapter) {
        await updateChapterMutation.mutateAsync({
          novelId,
          chapterNumber: chapter.chapterNumber,
          title: formData.title,
          content: formData.content,
        })
        toast.success('章节更新成功')
      } else {
        await createChapterMutation.mutateAsync({
          novelId,
          title: formData.title,
          content: formData.content,
        })
        toast.success('章节创建成功')
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('保存章节失败:', error)
      toast.error('保存章节失败，请重试')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader>{chapter ? '编辑章节' : '添加新章节'}</ModalHeader>
        <ModalBody>
          <Input
            label="章节标题"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <Textarea
            label="章节内容"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            minRows={10}
            required
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            {chapter ? '更新' : '创建'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
