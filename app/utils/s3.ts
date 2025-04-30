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
  trackNumber?: number;
}

function parseFilename(filename: string) {
  // 正则表达式解析文件名，格式：数字-标题-艺人-专辑.扩展名
  // (\d{0,3})：捕获0到3位数字；([\p{L}\s]+?)：捕获标题；(?:\s*\(.*?\))?：匹配括号中的内容但不捕获；(?:[-\·]\s*([\p{L}\s]+?))?：捕获艺人；(?:[-\·]\s*(.*?))?：捕获专辑
  // 支持中日文字符、版本信息括号内容、更灵活的分隔符
  const [_, track, title, artist, album] = filename.match(
    /^(\d{0,3})[-·]?\s*( [\p{L}\s]+?)(?:\s*\((.*?)\))?\s*(?:[-·]\s*([\p{L}\s]+?))?\s*(?:[-·]\s*(.*?))?\./u
  ) || [];
  const result = {
    title: title?.trim() || filename.split('.')[0],
    artist: artist?.trim() || '未知艺术家',
    album: album?.trim() || '未知专辑',
    trackNumber: track ? parseInt(track, 10) : undefined
  };
  console.log('增强解析结果:', { 
    原始文件名: filename,
    解析轨道号: track,
    解析标题: title,
    解析艺人: artist,
    解析专辑: album
  });
  return result;
}

export async function listPhotos(): Promise<Photo[]> {
  const files = await listFiles('photos/gallery/');
// 由于 ./oss 模块未导出 CDN_BASE_URL，需要先确保该模块导出该变量
// 此处假设暂时无法修改 ./oss 模块，先硬编码一个示例值，实际使用时需替换
const CDN_BASE_URL = 'https://example-cdn.com';
const baseUrl = `${CDN_BASE_URL}/`;
  return files.map(file => ({
    src: `${baseUrl}${file.Key?.replace('photos/gallery/', '') || ''}`,
    alt: file.Key?.split('/').pop()?.split('.')[0] || ''
  })).filter(photo => photo.src !== '');
}

export async function listMusic(): Promise<MusicInfo[]> {
  const files = await listFiles('music/albums/');
// 原代码中 map 方法需要正确返回 MusicInfo 类型的对象，之前可能存在返回值问题导致类型不匹配
return files.map((file): MusicInfo => {
  const filename = file.Key?.split('/').pop() || '';
  const { title, artist, album, trackNumber } = parseFilename(filename);
  // 由于 ./oss 模块未导出 CDN_BASE_URL，需要先确保该模块导出该变量
  // 此处假设暂时无法修改 ./oss 模块，先硬编码一个示例值，实际使用时需替换
  const CDN_BASE_URL = 'https://example-cdn.com';
  const baseUrl = `${CDN_BASE_URL}/`;
  return {
    title,
    artist,
    src: `${baseUrl}${filename}`,
    album,
    coverUrl: '/default-cover.jpg',
    trackNumber
  };
});
}