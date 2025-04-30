import { S3Client } from '@aws-sdk/client-s3';
import { config } from '../config';

const CDN_BASE_URL = config.cdn.baseUrl;

// S3 客户端配置
export const s3Client = new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
  },
  forcePathStyle: true,
  // 禁用默认的代理配置
  requestHandler: {
    httpOptions: {
      proxy: false
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

export function getPhotoUrl(path: string): string {
  return `${CDN_BASE_URL}/photos/gallery/${path}`;
}

export function getMusicUrl(path: string): string {
  return `${CDN_BASE_URL}/music/albums/${path}`;
}

export function getLogoUrl(path: string): string {
  return `${CDN_BASE_URL}/logos/${path}`;
}

// 获取桶名称
export const BUCKET_NAME = config.s3.bucketName; 