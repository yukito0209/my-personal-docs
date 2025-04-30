import { s3Client, BUCKET_NAME } from './oss';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function fetchFromS3(prefix: string) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix
    });

    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Error fetching from S3:', error);
    throw error;
  }
} 