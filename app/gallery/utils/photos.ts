import fs from 'fs';
import path from 'path';

export interface Photo {
  src: string;
  alt: string;
}

export async function getPhotos(): Promise<Photo[]> {
  try {
    const photosDir = path.join(process.cwd(), 'public', 'photos');
    const files = fs.readdirSync(photosDir)
      .filter(file => !file.startsWith('.') && (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png')));
    
    return files.map(file => ({
      src: `/photos/${file}`,
      alt: file.split('.')[0]
    }));
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
} 