import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" /* className={inter.className} */ suppressHydrationWarning>
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
