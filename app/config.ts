export const config = {
  s3: {
    accessKeyId: 'OX5JTEfF79ic1HDi',
    secretAccessKey: 'hgxHhDX8cvWie7T8nTdMIVkk21x5uv',
    endpoint: 'https://cn-nb1.rains3.com:443',  // 添加HTTPS标准端口
    region: 'cn-nb1',
    bucketName: 'your-domain-assets'
  },
  cdn: {
    baseUrl: 'https://your-domain-assets.cn-nb1.rains3.com' // 标准HTTPS配置
  }
} as const;