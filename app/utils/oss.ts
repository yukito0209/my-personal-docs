import { S3Client } from '@aws-sdk/client-s3';
import { config } from '../config';

const CDN_BASE_URL = config.cdn.baseUrl; // 直接使用配置中的完整CDN地址

// S3 客户端配置
export const s3Client = new S3Client({
  region: 'auto',
  endpoint: config.s3.endpoint,
  tls: true,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
  },
  forcePathStyle: true,
  // 移除requestHandler配置节
});

// SFTP配置
export const SFTP_CONFIG = {
  host: 'cn-nb1.rains3.com',
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