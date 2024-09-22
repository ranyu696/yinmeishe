/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
} from '@nextui-org/react'
import { type ComicImage } from '@prisma/client'
import { Upload, X } from 'lucide-react'
import React, { useCallback, useRef, useState } from 'react'
import { toast } from 'react-toastify'

interface UploadImageModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  comicId: number
  chapterNumber: number
}

export default function UploadImageModal({
  isOpen,
  onClose,
  onSuccess,
  comicId,
  chapterNumber,
}: UploadImageModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploadedCount, setUploadedCount] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const uploadCompleteRef = useRef(false)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const newFiles = Array.from(e.target.files)
        setFiles((prevFiles) => [...prevFiles, ...newFiles])
      }
    },
    [],
  )

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }, [])

  const uploadFile = async (file: File, index: number) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('comicId', comicId.toString())
    formData.append('chapterNumber', chapterNumber.toString())
    formData.append('order', index.toString())

    const response = await fetch('/api/upload/comic/chapter', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP 错误！地位: ${response.status}`)
    }

    return await response.json() as ComicImage;
  }

  const uploadNextFile = useCallback(
    async (index: number) => {
      if (index >= files.length || uploadCompleteRef.current) {
        if (!uploadCompleteRef.current) {
          uploadCompleteRef.current = true
          toast.success('所有章节图片上传成功!')
          onSuccess()
        }
        setIsUploading(false)
        return
      }

      const file = files[index]
      if (!file) {
        await uploadNextFile(index + 1)
        return
      }

      try {
        await uploadFile(file, index)
        setUploadedCount((prev) => prev + 1)
        setUploadProgress(((index + 1) / files.length) * 100)

        await uploadNextFile(index + 1)
      } catch (error) {
        console.error('上传错误:', error)
        toast.error(`上传章节图片失败: ${(error as Error).message}`)
        setIsUploading(false)
      }
    },
    [files, comicId, chapterNumber, onSuccess],
  )

  const handleSubmit = useCallback(() => {
    if (files.length > 0 && !isUploading) {
      setIsUploading(true)
      setUploadProgress(0)
      setUploadedCount(0)
      uploadCompleteRef.current = false
      void uploadNextFile(0)
    }
  }, [files, isUploading, uploadNextFile])

  const handleCloseModal = useCallback(() => {
    setFiles([])
    setUploadedCount(0)
    setUploadProgress(0)
    uploadCompleteRef.current = false
    onClose()
  }, [onClose])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          上传漫画章节图片
        </ModalHeader>
        <ModalBody>
          <Card>
            <CardBody>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
                id="comic-file-upload"
              />
              <label htmlFor="comic-file-upload" className="cursor-pointer">
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                  <Upload className="mx-auto size-12 text-gray-400" />
                  <p className="mt-1 text-sm text-gray-600">
                    点击或拖拽漫画图片到此处上传
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    支持多选,上传顺序将决定漫画阅读顺序
                  </p>
                </div>
              </label>
            </CardBody>
          </Card>

          {files.length > 0 && (
            <div className="mt-4">
              <p className="text-sm">已选择 {files.length} 张图片:</p>
              <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between rounded bg-gray-100 p-2"
                  >
                    <span className="truncate text-sm">{`${index + 1}. ${file.name}`}</span>
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      onPress={() => handleRemoveFile(index)}
                      size="sm"
                    >
                      <X size={18} />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isUploading && (
            <Progress
              value={uploadProgress}
              className="mt-4"
              label="上传进度"
              valueLabel={`${uploadedCount}/${files.length}`}
              showValueLabel={true}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={handleCloseModal}
            isDisabled={isUploading}
          >
            取消
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={files.length === 0 || isUploading}
            isLoading={isUploading}
          >
            {isUploading ? '上传中...' : '开始上传'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}