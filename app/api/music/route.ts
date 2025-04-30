import { NextResponse } from 'next/server';
import { getMusicUrl } from '@/app/utils/oss';
import { listMusic } from '@/app/utils/s3';

interface MusicInfo {
  title: string;
  artist: string;
  src: string;
  coverUrl?: string;
  album?: string;
}

export async function GET() {
  try {
    // 从S3获取音乐列表
    const musicFiles = await listMusic();
    
    // 处理音乐URL
    const processedMusicList = musicFiles.map(music => ({
      ...music,
      src: getMusicUrl(music.src),
      coverUrl: music.coverUrl ? getMusicUrl(music.coverUrl) : undefined
    }));

    return NextResponse.json({ files: processedMusicList });
  } catch (error) {
    console.error('Error fetching music files:', error);
    return NextResponse.json({ error: 'Failed to fetch music files' }, { status: 500 });
  }
} 