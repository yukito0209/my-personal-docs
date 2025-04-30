import { getPhotoUrl } from '@/app/utils/oss';
import { listPhotos } from '@/app/utils/s3';

export interface Photo {
  src: string;
  alt: string;
}

export async function getPhotos(): Promise<Photo[]> {
  try {
    // 从S3获取照片列表
    const photos = await listPhotos();
    
    // 处理照片URL
    return photos.map(photo => ({
      ...photo,
      src: getPhotoUrl(photo.src)
    }));
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
} 