export const config = {
  s3: {
    accessKeyId: 'LazYIIQ3mq3YIIB3',
    secretAccessKey: 'Exy5zkRVovBhwkpKSXoRnw8hB3mbQv',
    endpoint: 'https://cn-nb1.rains3.com',
    region: 'cn-nb1',
    bucketName: 'your-domain-assets'
  },
  cdn: {
    baseUrl: 'https://cn-nb1.rains3.com/your-domain-assets'
  }
} as const; 