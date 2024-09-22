import { type NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const pictureId = Number(formData.get('pictureId'));

    if (!file || !pictureId) {
      return NextResponse.json({ error: 'Missing file or pictureId' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const newFileName = `${uuidv4()}.webp`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'pictures', pictureId.toString());
    const filePath = join(uploadDir, newFileName);

    // 确保目录存在
    await mkdir(dirname(filePath), { recursive: true });

    // 先保存原始文件
    await writeFile(filePath, buffer);

    // 然后使用 sharp 处理图片
    const optimizedFilePath = filePath.replace('.webp', '_optimized.webp');
    const imageInfo = await sharp(buffer)
      .webp({ quality: 80 })
      .toFile(optimizedFilePath);

    const relativePath = `/uploads/pictures/${pictureId}/${newFileName.replace('.webp', '_optimized.webp')}`;

    const newImage = await prisma.pictureImage.create({
      data: {
        path: relativePath,
        width: imageInfo.width,
        height: imageInfo.height,
        size: imageInfo.size,
        mimeType: 'image/webp',
        pictureId,
        order: (await prisma.pictureImage.count({ where: { pictureId } })) + 1,
      },
    });

    const picture = await prisma.picture.findUnique({ where: { id: pictureId } });
    if (!picture?.coverUrl) {
      await prisma.picture.update({
        where: { id: pictureId },
        data: { coverUrl: newImage.path },
      });
    }

    return NextResponse.json(newImage);
  } catch (error) {
    console.error('上传错误:', error);
    return NextResponse.json({ error: '上传文件时出错', details: (error as Error).message }, { status: 500 });
  }
}