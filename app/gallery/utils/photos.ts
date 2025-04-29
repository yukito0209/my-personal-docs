import fs from 'fs';
import path from 'path';

export interface Photo {
  src: string;
  alt: string;
}

export function getPhotos(): Photo[] {
  const photosDir = path.join(process.cwd(), 'public', 'photos');
  
  // 确保目录存在
  if (!fs.existsSync(photosDir)) {
    return [];
  }

  // 读取目录中的所有文件
  const files = fs.readdirSync(photosDir);

  // 过滤出图片文件
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
  });

  // 将文件名转换为照片对象
  return imageFiles.map(file => ({
    src: `/photos/${file}`,
    // 移除扩展名作为默认的 alt 文本
    alt: path.basename(file, path.extname(file)),
  }));
} 