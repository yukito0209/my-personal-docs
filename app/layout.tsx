import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" /* className={inter.className} */ suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/LXGWWenKaiLite-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/LXGWWenKaiLite-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/backgrounds/bg_light.webp" as="image" type="image/webp" />
        <link rel="preload" href="/backgrounds/bg_dark.webp" as="image" type="image/webp" />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider theme={{ defaultTheme: 'system', enableSystem: true }}>
          <ThemeProvider>
            <MusicPlayerProvider>
              <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
                <ThemeToggle />
              </div>
              {children}
            </MusicPlayerProvider>
          </ThemeProvider>
        </RootProvider>
      </body>
    </html>
  );
}
