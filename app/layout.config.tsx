import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookText, Image as ImageIcon, Info } from 'lucide-react';
import React from 'react';
import { siGithub } from 'simple-icons/icons';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  githubUrl: 'https://github.com/yukito0209/my-personal-docs',
  nav: {
    title: (
      <span className='flex items-center'>
        <img
          src="https://avatars.githubusercontent.com/u/76610895?v=4"
          alt="Yukito's Avatar"
          width={24}
          height={24}
          style={{
            marginRight: '8px',
            borderRadius: '50%',
            verticalAlign: 'middle'
          }}
        />
        Yukito の 复式高层
      </span>
    ),
  },
  links: [
    {
      text: (
        <>
          <BookText className="mr-1.2 h-4 w-4 nav-link-icon" />
          <span className="nav-link-text">文档</span>
        </>
      ),
      url: '/docs',
      active: 'nested-url',
    },
    {
      text: (
        <>
          <ImageIcon className="mr-1.2 h-4 w-4 nav-link-icon" />
          <span className="nav-link-text">相册</span>
        </>
      ),
      url: '/gallery',
    },
    {
      text: (
        <>
          <Info className="mr-1.2 h-4 w-4 nav-link-icon" />
          <span className="nav-link-text">关于</span>
        </>
      ),
      url: '/about',
    },
  ],
};
