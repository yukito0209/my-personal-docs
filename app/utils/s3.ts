import { ListObjectsV2Command, _Object } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from './oss';

export async function listFiles(prefix: string): Promise<_Object[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix
    });

    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}

interface Photo {
  src: string;
  alt: string;
}

interface MusicInfo {
  title: string;
  artist: string;
  src: string;
  coverUrl?: string;
  album?: string;
}

export async function listPhotos(): Promise<Photo[]> {
  const files = await listFiles('photos/gallery/');
  return files.map(file => ({
    src: file.Key?.replace('photos/gallery/', '') || '',
    alt: file.Key?.split('/').pop()?.split('.')[0] || ''
  })).filter(photo => photo.src !== '');
}

export async function listMusic(): Promise<MusicInfo[]> {
  const files = await listFiles('music/albums/');
  return files.map(file => {
    const filename = file.Key?.split('/').pop() || '';
    const title = filename.split('.')[0];
    return {
      title,
      artist: '未知艺术家',
      src: filename,
      album: '未知专辑'
    };
  }).filter(music => music.src !== '');
} 