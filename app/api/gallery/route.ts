import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 构建指向 public/photos 的绝对路径
    const photosDir = path.join(process.cwd(), 'public', 'photos');
    
    // 读取目录内容
    const files = fs.readdirSync(photosDir)
      .filter(file => 
        // 过滤掉隐藏文件和非图片文件
        !file.startsWith('.') && 
        (file.toLowerCase().endsWith('.jpg') || 
         file.toLowerCase().endsWith('.png') || 
         file.toLowerCase().endsWith('.jpeg') || 
         file.toLowerCase().endsWith('.gif') || 
         file.toLowerCase().endsWith('.webp'))
      );
    
    // 映射为客户端需要的格式
    const photos = files.map(file => ({
      src: `/photos/${file}`, // Web 访问路径
      thumbnailSrc: `/photos/thumbnails/${file}`, // 缩略图 Web 访问路径
      alt: file.split('.').slice(0, -1).join('.') // 文件名作为 alt (移除扩展名)
    }));

    // 返回 JSON 数据
    return NextResponse.json({ photos });

  } catch (error) {
    console.error('API Error loading gallery:', error);
    // 返回错误信息
    return NextResponse.json(
      { message: 'Failed to load photos.', error: (error as Error).message }, 
      { status: 500 }
    );
  }
} 