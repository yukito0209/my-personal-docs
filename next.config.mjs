import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
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
      // 如果还有其他外部图片域名，继续在这里添加
    ],
    dangerouslyAllowSVG: true,
    // 如果 remotePatterns 不适用于你的 Next.js 版本，可以尝试 domains:
    // domains: ['img.shields.io', 'avatars.githubusercontent.com'],
  },
};

// 将包含 images 配置的 config 对象传递给 withMDX
export default withMDX(config);