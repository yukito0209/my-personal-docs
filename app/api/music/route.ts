import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as mm from 'music-metadata';

interface MusicInfo {
  title: string;
  artist: string;
  src: string;
  coverUrl?: string;
  album?: string;
}

async function extractCoverFromFlac(filePath: string, fileName: string): Promise<string | undefined> {
  try {
    const metadata = await mm.parseFile(filePath);
    const picture = metadata.common.picture?.[0];
    
    if (picture) {
      const coverFileName = `${fileName.substring(0, fileName.lastIndexOf('.'))}_cover.jpg`;
      const coverPath = path.join(process.cwd(), 'public', 'music', coverFileName);
      
      // 如果封面文件不存在，则创建
      if (!fs.existsSync(coverPath)) {
        fs.writeFileSync(coverPath, picture.data);
      }
      
      return `/music/${coverFileName}`;
    }
    return undefined;
  } catch (error) {
    console.error('Error extracting cover from FLAC:', error);
    return undefined;
  }
}

export async function GET() {
  try {
    const musicDir = path.join(process.cwd(), 'public', 'music');
    const files = fs.readdirSync(musicDir)
      .filter(file => file.endsWith('.mp3') || file.endsWith('.flac'));
    
    const musicFiles = await Promise.all(files.map(async file => {
      const filePath = path.join(musicDir, file);
      const fileNameWithoutExt = file.substring(0, file.lastIndexOf('.'));
      const parts = fileNameWithoutExt.split(' - ');
      const artist = parts.length > 1 ? parts[0] : '未知艺术家';
      const songTitle = parts.length > 1 ? parts[1].replace('(MyGO!!!!! ver.)', '').trim() : fileNameWithoutExt;
      
      // 检查是否存在封面
      const coverFileName = `${fileNameWithoutExt}_cover.jpg`;
      const coverPath = path.join(musicDir, coverFileName);
      const hasCover = fs.existsSync(coverPath);
      
      // 如果没有封面且是 FLAC 文件，尝试提取
      let coverUrl: string | undefined;
      if (hasCover) {
        coverUrl = `/music/${coverFileName}`;
      } else if (file.endsWith('.flac')) {
        coverUrl = await extractCoverFromFlac(filePath, file);
      }
      
      return {
        title: songTitle,
        artist,
        src: `/music/${file}`,
        coverUrl,
        album: parts.length > 2 ? parts[2] : '未知专辑'
      };
    }));

    return NextResponse.json({ files: musicFiles });
  } catch (error) {
    console.error('Error fetching music files:', error);
    return NextResponse.json({ error: 'Failed to fetch music files' }, { status: 500 });
  }
} 