// 定义上传mutation的输入类型
interface UploadMutationInput {
  imageData: string
  // 可以根据需要添加其他字段
}

// 定义上传mutation的输出类型
interface UploadMutationOutput {
  url: string
  // 添加其他可能的返回字段
}

export async function processAndUploadImage(
  file: File,
  uploadMutation: (data: UploadMutationInput) => Promise<UploadMutationOutput>,
): Promise<UploadMutationOutput> {
  try {
    // 客户端预处理
    const processedFile = await preprocessImage(file)

    // 转换为 base64
    const base64 = await fileToBase64(processedFile)

    // 执行上传
    return await uploadMutation({
      imageData: base64,
    })
  } catch (error) {
    console.error('处理和上传图片时出错:', error)
    throw error instanceof Error ? error : new Error('未知错误')
  }
}

async function preprocessImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl) // 清理创建的 URL
      const canvas = document.createElement('canvas')
      const width = img.width
      const height = img.height

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('无法创建canvas上下文'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)

      // 确定输出格式
      let outputType = file.type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(outputType)) {
        outputType = 'image/jpeg' // 默认为 JPEG
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            reject(new Error('图像压缩失败'))
          }
        },
        outputType,
        0.8,
      ) // 压缩质量为 80%
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl) // 清理创建的 URL
      reject(new Error('图像加载失败'))
    }
    img.src = objectUrl
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
