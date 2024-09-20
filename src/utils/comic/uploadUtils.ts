export interface CoverUploadData {
  imageSource: string
  comicId: number
  shouldSync?: boolean
}

export interface ChapterUploadData {
  imageSource: string
  comicId: number
  chapterNumber: number
  order: number
}

export interface CoverUploadResult {
  coverPath: string
  width: number
  height: number
  success: boolean
}

export interface ChapterUploadResult {
  format: string
  size: number
  width: number
  height: number
  channels: 1 | 2 | 3 | 4
  premultiplied: boolean
  cropOffsetLeft?: number
  cropOffsetTop?: number
  trimOffsetLeft?: number
  trimOffsetTop?: number
  success: boolean
}

export type UploadResult = CoverUploadResult | ChapterUploadResult

export async function processAndUploadImage(
  file: File,
  type: 'cover' | 'chapter',
  comicId: number,
  uploadMutation: (
    data: CoverUploadData | ChapterUploadData,
  ) => Promise<UploadResult>,
  chapterNumber?: number,
  order?: number,
  shouldSync?: boolean,
): Promise<UploadResult> {
  const processedFile = await preprocessImage(file)
  const base64 = await fileToBase64(processedFile)

  if (type === 'cover') {
    return uploadMutation({
      imageSource: base64,
      comicId,
      shouldSync,
    } as CoverUploadData) as Promise<CoverUploadResult>
  } else if (
    type === 'chapter' &&
    chapterNumber !== undefined &&
    order !== undefined
  ) {
    return uploadMutation({
      imageSource: base64,
      comicId,
      chapterNumber,
      order,
    } as ChapterUploadData) as Promise<ChapterUploadResult>
  } else {
    throw new Error('上传类型无效或缺少必要参数')
  }
}

async function preprocessImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const width = img.width
      const height = img.height

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('无法创建 canvas 上下文'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            reject(new Error('图像压缩失败'))
          }
        },
        'image/jpeg',
        0.8,
      ) // 压缩质量为 80%
    }
    img.onerror = () => reject(new Error('图像加载失败'))
    img.src = URL.createObjectURL(file)
  })
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('文件读取结果不是字符串'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
  })
}
