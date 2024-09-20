import {
  Button,
  Card,
  CardBody,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
} from '@nextui-org/react'
import { AlertCircle, Upload, X } from 'lucide-react'
import React, { useCallback, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '~/trpc/react'
import { processAndUploadImage } from '~/utils/image/uploadUtils'

interface UploadImageModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  imageSetId: number
}

const MAX_FILE_SIZE = 30 * 1024 * 1024 // 20MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_CONCURRENT_UPLOADS = 3 // 最大并发上传数

export default function UploadImageModal({
  isOpen,
  onClose,
  onSuccess,
  imageSetId,
}: UploadImageModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number[]>([])
  const [uploadedCount, setUploadedCount] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [processingFiles, setProcessingFiles] = useState<string[]>([])
  const uploadCompleteRef = useRef(false)

  const uploadImage = api.picture.uploadImage.useMutation()

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const fileList: FileList = e.target.files
        const newFiles = Array.from(fileList).filter((file) => {
          if (file.size > MAX_FILE_SIZE) {
            toast.warn(`文件 ${file.name} 超过20MB限制，已被忽略`)
            return false
          }
          if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast.warn(
              `文件 ${file.name} 类型不支持，请上传 JPG, PNG 或 WebP 格式`,
            )
            return false
          }
          return true
        })
  
        setFiles((prevFiles) => [...prevFiles, ...newFiles])
      }
    },
    [setFiles]
  )
  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
    setUploadProgress((prev) => prev.filter((_, i) => i !== index))
    toast.info('已移除文件')
  }, [])

  const uploadFile = useCallback(
    async (file: File, index: number) => {
      setProcessingFiles((prev) => [...prev, file.name])
      try {
        await processAndUploadImage(file, imageSetId, async (data) => {
          const result = await uploadImage.mutateAsync(data)
          // 适配返回类型
          return { url: result.path, ...result }
        })
        setUploadedCount((prev) => prev + 1)
        setUploadProgress((prev) => prev.map((p, i) => (i === index ? 100 : p)))
      } catch (error) {
        console.error('上传错误:', error)
        toast.error(`上传 ${file.name} 失败: ${(error as Error).message}`)
      } finally {
        setProcessingFiles((prev) => prev.filter((name) => name !== file.name))
      }
    },
    [imageSetId, uploadImage],
  )
  const uploadFiles = useCallback(async () => {
    const uploadPromises = files.map(
      (file, index) => () => uploadFile(file, index),
    )

    // 使用 p-limit 来限制并发数
    const pLimit = (await import('p-limit')).default
    const limit = pLimit(MAX_CONCURRENT_UPLOADS)

    await Promise.all(
      uploadPromises.map((uploadPromise) => limit(uploadPromise)),
    )

    setIsUploading(false)
    if (!uploadCompleteRef.current) {
      uploadCompleteRef.current = true
      toast.success('所有图片上传成功!')
      onSuccess()
      setTimeout(() => {
        onClose()
        setFiles([])
        setUploadedCount(0)
        setUploadProgress([])
        uploadCompleteRef.current = false
      }, 1000)
    }
  }, [files, uploadFile, onSuccess, onClose])

  const handleSubmit = useCallback(() => {
    if (files.length > 0 && !isUploading) {
      setIsUploading(true)
      setUploadedCount(0)
      uploadCompleteRef.current = false
      void uploadFiles()
    }
  }, [files, isUploading, uploadFiles])

  const totalProgress =
    uploadProgress.reduce((sum, progress) => sum + progress, 0) / files.length
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">上传图片</ModalHeader>
            <ModalBody>
              <Card>
                <CardBody>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept={ALLOWED_FILE_TYPES.join(',')}
                    multiple
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400">
                      <Upload className="mx-auto size-12 text-gray-400" />
                      <p className="mt-1 text-sm text-gray-600">
                        点击或拖拽文件到此处上传
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        支持 JPG, PNG, WebP / 最大 5MB
                      </p>
                    </div>
                  </label>
                </CardBody>
              </Card>

              {files.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold">
                    已选择 {files.length} 个文件:
                  </p>
                  <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto">
                    {files.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between rounded bg-gray-100 p-2"
                      >
                        <div className="flex items-center space-x-2">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="size-10 rounded object-cover"
                          />
                          <span className="truncate text-sm">{file.name}</span>
                        </div>
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
                <div className="mt-4 space-y-2">
                  <Progress
                    value={totalProgress}
                    className="mt-4"
                    label="总体上传进度"
                    valueLabel={`${uploadedCount}/${files.length}`}
                    showValueLabel={true}
                  />
                  {processingFiles.length > 0 && (
                    <p className="text-sm text-gray-600">
                      正在处理: {processingFiles.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {files.length === 0 && !isUploading && (
                <div className="mt-4 flex items-center justify-center text-gray-500">
                  <AlertCircle className="mr-2" size={18} />
                  <span>请选择要上传的图片</span>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
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
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
