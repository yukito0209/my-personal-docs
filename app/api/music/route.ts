import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import * as mm from 'music-metadata';
import sharp from 'sharp';

interface MusicInfo {
  title: string;
  artist: string;
  src: string;
  coverUrl?: string;
  album?: string;
}

async function extractMusicMetadata(filePath: string, fileName: string): Promise<MusicInfo> {
  try {
    const buffer = await fs.readFile(filePath);
    const metadata = await mm.parseBuffer(buffer);
    const picture = metadata.common.picture?.[0];
    let coverUrl: string | undefined;

    // 如果音乐文件中包含封面图片
    if (picture) {
      const coverFileName = `${path.basename(fileName, path.extname(fileName))}_cover.jpg`;
      const coverPath = path.join(process.cwd(), 'public', 'music', coverFileName);
      
      await fs.writeFile(coverPath, picture.data);
      coverUrl = `/music/${coverFileName}`;
    }

    return {
      title: metadata.common.title || path.basename(fileName, path.extname(fileName)),
      artist: metadata.common.artist || '未知艺术家',
      album: metadata.common.album,
      src: `/music/${fileName}`,
      coverUrl
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    // 如果无法提取元数据，返回基本信息
    return {
      title: path.basename(fileName, path.extname(fileName)),
      artist: '未知艺术家',
      src: `/music/${fileName}`
    };
  }
}

export async function GET() {
  try {
    const musicDir = path.join(process.cwd(), 'public', 'music');
    
    // 确保目录存在
    try {
      await fs.access(musicDir);
    } catch {
      return NextResponse.json({ files: [] });
    }

    const files = await fs.readdir(musicDir);
    
    // 过滤音乐文件并提取元数据
    const musicFiles = await Promise.all(
      files
        .filter(file => /\.(mp3|wav|ogg|flac)$/i.test(file))
        .map(async file => {
          const filePath = path.join(musicDir, file);
          return await extractMusicMetadata(filePath, file);
        })
    );

    return NextResponse.json({ files: musicFiles });
  } catch (error) {
    console.error('Error reading music directory:', error);
    return NextResponse.json({ files: [] });
  }
} 