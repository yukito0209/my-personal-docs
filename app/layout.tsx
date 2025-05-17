import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { BackgroundViewToggle } from './components/BackgroundViewToggle';
import type { Metadata } from 'next';
// import DynamicLive2DLoader from './components/DynamicLive2DLoader'; // Replaced by InteractiveAmiya
import InteractiveAmiya from './components/InteractiveAmiya'; // Import the new component

// Add metadata for favicon
export const metadata: Metadata = {
  // You might want to add other metadata fields like title, description here later
  icons: {
    icon: 'https://avatars.githubusercontent.com/u/76610895?v=4',
    apple: 'https://avatars.githubusercontent.com/u/76610895?v=4', // for Apple touch icon
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" /* className={inter.className} */ suppressHydrationWarning>
      <head>
        <link rel="preload" href="/backgrounds/bg_light.webp" as="image" type="image/webp" />
        <link rel="preload" href="/backgrounds/bg_dark.webp" as="image" type="image/webp" />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider theme={{ defaultTheme: 'system', enableSystem: true }}>
          <ThemeProvider>
            <MusicPlayerProvider>
              <div id="main-content-wrapper">
                {/* 网站横幅开始 */}
                {/* <Banner variant="rainbow" id="1">个人网站绝赞施工中(๑•̀ㅂ•́)و✧</Banner>  */}
                {/* 网站横幅结束 */}
                {children}
              </div>
              <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6 flex flex-col-reverse items-end gap-2">
                <ThemeToggle />
                <BackgroundViewToggle />
              </div>
              {/* <DynamicLive2DLoader /> Replaced by InteractiveAmiya below */}
              <InteractiveAmiya /> {/* Add the new component here */}
            </MusicPlayerProvider>
          </ThemeProvider>
        </RootProvider>
      </body>
    </html>
  );
}
