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

async function getMusicMetadata(filePath: string, fileName: string): Promise<MusicInfo> {
  try {
    const metadata = await mm.parseFile(filePath);
    const common = metadata.common;
    
    // 从文件名中提取序号（如果存在）
    const numberMatch = fileName.match(/^(\d+)-/);
    const number = numberMatch ? numberMatch[1] : '';
    
    // 获取基本信息，使用元数据或文件名作为后备
    const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const fileNameWithoutNumber = fileNameWithoutExt.replace(/^\d+-/, '');
    
    // 处理特殊版本标记
    const versionMatch = fileNameWithoutNumber.match(/\((.*?)\)/);
    const version = versionMatch ? ` (${versionMatch[1]})` : '';
    
    // 处理封面
    let coverUrl: string | undefined;
    const picture = metadata.common.picture?.[0];
    if (picture) {
      const coverFileName = `${fileNameWithoutExt}_cover.jpg`;
      const coverPath = path.join(process.cwd(), 'public', 'music', coverFileName);
      
      // 如果封面文件不存在，则创建
      if (!fs.existsSync(coverPath)) {
        fs.writeFileSync(coverPath, picture.data);
      }
      
      coverUrl = `/music/${coverFileName}`;
    }
    
    return {
      title: (common.title || fileNameWithoutNumber.replace(/\s*\(.*?\)$/, '')) + version,
      artist: common.artist || common.albumartist || '未知艺术家',
      album: common.album || '未知专辑',
      src: `/music/${fileName}`,
      coverUrl
    };
  } catch (error) {
    console.error('Error reading metadata:', error);
    // 如果无法读取元数据，使用文件名作为后备
    const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    return {
      title: fileNameWithoutExt.replace(/^\d+-/, ''),
      artist: '未知艺术家',
      album: '未知专辑',
      src: `/music/${fileName}`,
      coverUrl: undefined
    };
  }
}

export async function GET() {
  try {
    const musicDir = path.join(process.cwd(), 'public', 'music');
    const files = fs.readdirSync(musicDir)
      .filter(file => file.endsWith('.mp3') || file.endsWith('.flac'));
    
    const musicFiles = await Promise.all(files.map(async file => {
      const filePath = path.join(musicDir, file);
      const musicInfo = await getMusicMetadata(filePath, file);
      
      // 检查是否存在封面
      const fileNameWithoutExt = file.substring(0, file.lastIndexOf('.'));
      const coverFileName = `${fileNameWithoutExt}_cover.jpg`;
      const coverPath = path.join(musicDir, coverFileName);
      const hasCover = fs.existsSync(coverPath);
      
      // 如果已经有封面，使用现有封面
      if (hasCover && !musicInfo.coverUrl) {
        musicInfo.coverUrl = `/music/${coverFileName}`;
      }
      
      return musicInfo;
    }));

    return NextResponse.json({ files: musicFiles });
  } catch (error) {
    console.error('Error fetching music files:', error);
    return NextResponse.json({ error: 'Failed to fetch music files' }, { status: 500 });
  }
} 