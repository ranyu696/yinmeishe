/* eslint-disable @typescript-eslint/no-unsafe-argument */
import axios from 'axios'
import crypto from 'crypto'
import fs from 'fs-extra'
import path from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

export async function uploadNovelCover(
  imageSource: string,
  shouldSync: boolean,
): Promise<{ coverPath: string }> {
  if (!shouldSync) {
    // 如果不需要同步，直接返回原始链接
    return { coverPath: imageSource }
  }

  let buffer: Buffer | Uint8Array

  if (imageSource.startsWith('data:image')) {
    // 处理 base64 编码的图片数据
    const base64Data = imageSource.split(',')[1]
    if (!base64Data) {
      throw new Error('图像数据无效')
    }
    buffer = Buffer.from(base64Data, 'base64')
  } else if (imageSource.startsWith('http')) {
    // 处理远程图片链接
    try {
      const response = await axios.get(imageSource, {
        responseType: 'arraybuffer',
      })
      buffer = Buffer.from(response.data, 'binary')
    } catch (error) {
      console.error('下载远程图片失败:', error)
      throw new Error('下载远程图片失败')
    }
  } else {
    throw new Error('无效的图片源')
  }

  const filename = `${Date.now()}_${uuidv4()}.webp`
  const novelDir = path.join(process.cwd(), 'public', 'uploads', 'novels')
  const filepath = path.join(novelDir, filename)

  // 确保目录存在
  await fs.ensureDir(novelDir)

  try {
    // 保存图片到本地，使用类型断言来解决类型不匹配的问题
    await sharp(buffer).webp({ quality: 80 }).toFile(filepath)

    const relativePath = `/uploads/novels/${filename}`
    return { coverPath: relativePath }
  } catch (error) {
    console.error('保存图片失败:', error)
    throw new Error('保存图片失败')
  }
}

export async function uploadVideoCover(
  imageSource: string,
  shouldSync: boolean,
): Promise<{ coverPath: string }> {
  if (!shouldSync) {
    // 如果不需要同步，直接返回原始链接
    return { coverPath: imageSource }
  }

  let buffer: Buffer | Uint8Array

  if (imageSource.startsWith('data:image')) {
    // 处理 base64 编码的图片数据
    const base64Data = imageSource.split(',')[1]
    if (!base64Data) {
      throw new Error('图像数据无效')
    }
    buffer = Buffer.from(base64Data, 'base64')
  } else if (imageSource.startsWith('http')) {
    // 处理远程图片链接
    try {
      const response = await axios.get(imageSource, {
        responseType: 'arraybuffer',
      })
      buffer = Buffer.from(response.data, 'binary')
    } catch (error) {
      console.error('下载远程图片失败:', error)
      throw new Error('下载远程图片失败')
    }
  } else {
    throw new Error('无效的图片源')
  }

  const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'video')
  // 生成基于日期的目录
  const date = new Date()
  const datePath = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`
  const finalDir = path.join(UPLOAD_DIR, datePath)

  // 生成唯一的文件名
  const uniqueId = crypto.randomBytes(8).toString('hex')
  const fileName = `${uniqueId}.webp`

  // 确保目录存在
  await fs.ensureDir(finalDir)

  const filepath = path.join(finalDir, fileName)

  try {
    // 保存图片到本地
    await sharp(buffer).webp({ quality: 80 }).toFile(filepath)

    const relativePath = `/uploads/videos/${datePath}/${fileName}`
    return { coverPath: relativePath }
  } catch (error) {
    console.error('保存图片失败:', error)
    throw new Error('保存图片失败')
  }
}
export async function uploadImage(
  imageData: string,
  fileName: string,
  category: string,
) {
  let buffer: Buffer

  if (imageData.startsWith('data:image')) {
    const base64Data = imageData.split(',')[1]
    if (!base64Data) {
      throw new Error('图像数据无效')
    }
    buffer = Buffer.from(base64Data, 'base64')
  } else {
    throw new Error('无效的图片源')
  }
  const UPLOAD_DIR = path.join(process.cwd(), 'public', 'settings')
  const date = new Date()
  const datePath = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`
  const finalDir = path.join(UPLOAD_DIR, category, datePath)

  const uniqueId = crypto.randomBytes(8).toString('hex')
  const fileExt = path.extname(fileName)
  const newFileName = `${uniqueId}${fileExt}`

  await fs.ensureDir(finalDir)

  const filepath = path.join(finalDir, newFileName)

  try {
    const metadata = await sharp(buffer).webp({ quality: 80 }).toFile(filepath)

    const relativePath = `/uploads/settings/${category}/${datePath}/${newFileName}`
    return {
      filePath: relativePath,
      width: metadata.width,
      height: metadata.height,
    }
  } catch (error) {
    console.error('保存图片失败:', error)
    throw new Error('保存图片失败')
  }
}
