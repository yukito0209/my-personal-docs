'use client';

import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';
import { useEffect } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // 为文档页面添加特定的body类名
    document.body.classList.add('docs-page');
    return () => {
      document.body.classList.remove('docs-page');
    };
  }, []);

  return (
    <div className="docs-page-layout">
      <DocsLayout 
        tree={source.pageTree} 
        {...baseOptions} 
      >
        {children}
      </DocsLayout>
    </div>
  );
}
