import React, { useCallback, useRef, useState } from 'react';
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
} from '@nextui-org/react';
import { AlertCircle, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { type PictureImage } from '@prisma/client';

interface UploadImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  imageSetId: number;
}

export default function UploadImageModal({
  isOpen,
  onClose,
  onSuccess,
  imageSetId,
}: UploadImageModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const handleFileChange = useCallback((fileList: FileList | null) => {
    if (fileList) {
      const newFiles = Array.from(fileList).filter((file) => {
        if (file.size > 20 * 1024 * 1024) {
          toast.warn(`文件 ${file.name} 超过20MB限制，已被忽略`);
          return false;
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          toast.warn(`文件 ${file.name} 类型不支持，请上传 JPG, PNG 或 WebP 格式`);
          return false;
        }
        return true;
      });
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  }, []);

  const handleRemoveFile = useCallback((fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  }, []);

  const handleUpload = useCallback(async () => {
    setIsUploading(true);
    setTotalProgress(0);
  
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('pictureId', imageSetId.toString());
  
        const response = await fetch('/api/upload/picture', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error('上传失败');
        }
  
        const result = await response.json() as PictureImage;
        console.log(`文件 ${file.name} 上传成功，路径: ${result.path}`);
        toast.success(`${file.name} 上传成功`);
  
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        setTotalProgress((prev) => prev + (1 / files.length) * 100);
      } catch (error) {
        console.error('上传错误:', error);
        toast.error(`上传 ${file.name} 失败: ${(error as Error).message}`);
      }
    }
  
    setIsUploading(false);
    onSuccess();
    setFiles([]);
    setUploadProgress({});
    setTotalProgress(0);
  }, [files, imageSetId, onSuccess]);

  // 实现拖放功能
  React.useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.files) {
        handleFileChange(e.dataTransfer.files);
      }
    };

    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('drop', handleDrop);

    return () => {
      dropArea.removeEventListener('dragover', handleDragOver);
      dropArea.removeEventListener('drop', handleDrop);
    };
  }, [handleFileChange]);


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
                    onChange={(e) => handleFileChange(e.target.files)}
                    multiple
                    className="hidden"
                    id="file-upload"
                    ref={fileInputRef}
                  />
                  <div
                    ref={dropAreaRef}
                    className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto size-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-600">
                      点击或拖拽文件到此处上传
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      支持 JPG, PNG, WebP / 最大 20MB
                    </p>
                  </div>
                </CardBody>
              </Card>

              {files.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold">
                    已选择 {files.length} 个文件:
                  </p>
                  <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto">
                    {files.map((file) => (
                      <li
                        key={file.name}
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
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={uploadProgress[file.name] ?? 0}
                            size="sm"
                            className="w-24"
                          />
                          <Button
                            isIconOnly
                            color="danger"
                            variant="light"
                            onPress={() => handleRemoveFile(file.name)}
                            size="sm"
                          >
                            <X size={18} />
                          </Button>
                        </div>
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
                    valueLabel={`${Math.round(totalProgress)}%`}
                    showValueLabel={true}
                  />
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
                onPress={handleUpload}
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
  );
}