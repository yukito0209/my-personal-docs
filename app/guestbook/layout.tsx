import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';

export default function GuestbookLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <HomeLayout {...baseOptions}>
      {children}
    </HomeLayout>
  );
} 