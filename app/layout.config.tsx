import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookText, Image as ImageIcon, Info } from 'lucide-react';
import React from 'react';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        {/* <svg
          width="24"
          height="24"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Logo"
        >
          <circle cx={12} cy={12} r={12} fill="currentColor" />
        </svg> */}
        <img
          src="https://avatars.githubusercontent.com/u/76610895?v=4" // 你的 GitHub 头像 URL
          alt="Yukito's Avatar" // 添加描述性 alt 文本
          width={24} // 保持和原来 svg 一致的宽度
          height={24} // 保持和原来 svg 一致的高度
          style={{
            marginRight: '8px',
            borderRadius: '50%', // 使图片呈圆形，更像头像
            verticalAlign: 'middle' // 尝试让图片和文字垂直居中对齐
          }}
        />
        Yukito の 复式高层
      </>
    ),
  },
  links: [
    {
      text: (
        <>
          <BookText className="mr-1.2 h-4 w-4" />
          文档
        </>
      ),
      url: '/docs',
      active: 'nested-url',
    },
    {
      text: (
        <>
          <ImageIcon className="mr-1.2 h-4 w-4" />
          相册
        </>
      ),
      url: '/gallery',
    },
    {
      text: (
        <>
          <Info className="mr-1.2 h-4 w-4" />
          关于
        </>
      ),
      url: '/about',
    },
  ],
};
