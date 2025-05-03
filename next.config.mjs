import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  devIndicators: false, // 关闭开发指示器
  // 在这里添加 images 配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.shields.io', // 允许 shields.io
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // 允许 GitHub 头像
      },
      {
        protocol: 'https',
        hostname: 'www.cityu.edu.hk', // 允许香港城市大学域名
      },
      {
        protocol: 'https',
        hostname: 'www.nuist.edu.cn', // 允许南京信息工程大学域名
      },
      {
        protocol: 'https',
        hostname: 'your-domain-assets.cn-nb1.rains3.com', // 允许 S3 域名
      },
      // 如果还有其他外部图片域名，继续在这里添加
    ],
    domains: ['your-domain-assets.cn-nb1.rains3.com'], // 添加 domains 配置作为备选
    dangerouslyAllowSVG: true,
    // 如果 remotePatterns 不适用于你的 Next.js 版本，可以尝试 domains:
    // domains: ['img.shields.io', 'avatars.githubusercontent.com'],
    unoptimized: true, // 允许加载本地图片
  },
  // 配置 webpack 以支持音频文件
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|flac)$/i,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/media',
          outputPath: 'static/media',
          name: '[name].[hash].[ext]',
        },
      },
    });
    return config;
  },
};

// 将包含 images 配置的 config 对象传递给 withMDX
export default withMDX(config);