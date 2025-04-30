import { S3Client } from '@aws-sdk/client-s3';
import { config } from '../config';

const CDN_BASE_URL = config.cdn.baseUrl;

// 调试信息
console.log('S3 Configuration:', {
  endpoint: config.s3.endpoint,
  region: config.s3.region,
  bucketName: config.s3.bucketName,
  cdnBaseUrl: CDN_BASE_URL
});

// S3 客户端配置
export const s3Client = new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
  },
  forcePathStyle: true,
  requestHandler: {
    httpOptions: {
      timeout: 30000,
      connectTimeout: 30000,
      keepAlive: true,
      // 禁用代理
      proxy: undefined,
      // SSL 配置
      rejectUnauthorized: false, // 允许自签名证书
      checkServerIdentity: () => undefined // 禁用主机名验证
    }
  }
});

// SFTP配置
export const SFTP_CONFIG = {
  host: new URL(config.s3.endpoint).hostname,
  port: 8022,
  username: config.s3.accessKeyId,
  password: config.s3.secretAccessKey
};

// 使用公共访问 URL
export function getPhotoUrl(path: string): string {
  // 如果路径已经是完整的 URL，直接返回
  if (path.startsWith('http')) {
    return path;
  }
  // 移除路径开头的斜杠
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const url = `${CDN_BASE_URL}/${cleanPath}`;
  console.log('Generated Photo URL:', url);
  return url;
}

export function getMusicUrl(path: string): string {
  // 如果路径已经是完整的 URL，直接返回
  if (path.startsWith('http')) {
    return path;
  }
  // 移除路径开头的斜杠
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const url = `${CDN_BASE_URL}/music/albums/${cleanPath}`;
  console.log('Generated Music URL:', url);
  return url;
}

export function getLogoUrl(path: string): string {
  // 如果路径已经是完整的 URL，直接返回
  if (path.startsWith('http')) {
    return path;
  }
  // 移除路径开头的斜杠
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const url = `${CDN_BASE_URL}/logos/${cleanPath}`;
  console.log('Generated Logo URL:', url);
  return url;
}

// 获取桶名称
export const BUCKET_NAME = config.s3.bucketName; 