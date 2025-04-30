export const config = {
  s3: {
    accessKeyId: '0X5JTEF79ic1HDi',
    secretAccessKey: 'hgxHhDX8cvWie7T8nTdMIVkk21x5uv',
    endpoint: 'https://cn-nb1.rains3.com',
    region: 'cn-nb1',
    bucketName: 'your-domain-assets'
  },
  cdn: {
    baseUrl: 'https://your-domain-assets.cn-nb1.rains3.com'
  }
} as const; 