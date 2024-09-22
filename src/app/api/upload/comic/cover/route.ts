import { type NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import sharp from 'sharp';
import { db } from '~/server/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const comicId = Number(formData.get('comicId'));
    const shouldSync = formData.get('shouldSync') === 'true';

    if (!file || !comicId) {
      return NextResponse.json({ error: 'Missing file or comicId' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `cover_${comicId}.webp`;
    const comicDir = join(process.cwd(), 'public', 'uploads', 'comics', comicId.toString());
    const filepath = join(comicDir, filename);

    // 确保目录存在
    await mkdir(dirname(filepath), { recursive: true });

    const metadata = await sharp(buffer)
      .webp({ quality: 80 })
      .toFile(filepath);

    if (shouldSync) {
      const originalFilepath = join(comicDir, `cover_original_${comicId}${file.name.split('.').pop()}`);
      await writeFile(originalFilepath, buffer);
    }

    const relativePath = `/uploads/comics/${comicId}/${filename}`;

    // 更新数据库中的封面路径
    await db.comic.update({
      where: { id: comicId },
      data: { coverUrl: relativePath },
    });

    return NextResponse.json({
      coverPath: relativePath,
      width: metadata.width,
      height: metadata.height,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '上传文件时出错', details: (error as Error).message }, { status: 500 });
  }
}