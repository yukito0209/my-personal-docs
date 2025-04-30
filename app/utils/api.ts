import { s3Client, BUCKET_NAME } from './oss';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchFromS3(prefix: string) {
  let lastError;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt} to fetch from S3:`, {
        bucket: BUCKET_NAME,
        prefix,
        endpoint: s3Client.config.endpoint
      });

      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        Delimiter: '/'
      });

      const response = await s3Client.send(command);
      console.log('S3 response:', {
        statusCode: response.$metadata.httpStatusCode,
        requestId: response.$metadata.requestId,
        contentsCount: response.Contents?.length || 0
      });

      if (!response.Contents) {
        console.warn('No contents found in S3 response');
        return [];
      }

      return response.Contents;
    } catch (error) {
      lastError = error;
      console.error(`Error fetching from S3 (attempt ${attempt}):`, {
        error: error instanceof Error ? error.message : error,
        bucket: BUCKET_NAME,
        prefix,
        endpoint: s3Client.config.endpoint
      });

      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await delay(RETRY_DELAY);
      }
    }
  }

  throw new Error(`Failed to fetch from S3 after ${MAX_RETRIES} attempts: ${lastError instanceof Error ? lastError.message : lastError}`);
} 