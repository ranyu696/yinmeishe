import { promises as fs } from 'fs'
import { type NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const filePath = path.join(process.cwd(), 'public', 'uploads', ...params.path)

  try {
    const fileBuffer = await fs.readFile(filePath)

    // 获取文件类型
    const fileType = path.extname(filePath).substring(1)

    // 设置适当的 Content-Type
    const contentType = getContentType(fileType)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error reading file:', error)
    return new NextResponse('File not found', { status: 404 })
  }
}

function getContentType(fileType: string): string {
  const types: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    // 添加其他文件类型
  }
  return types[fileType] ?? 'application/octet-stream'
}
