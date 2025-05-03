import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t glass-effect">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-y-4 sm:flex-row sm:gap-y-0">
          <div className="flex items-center space-x-1.5 text-sm text-muted-foreground">
            <span>© {currentYear}</span>
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>by</span>
            <Link 
              href="https://github.com/yukito0209" 
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary transition-colors"
            >
              Yukito
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link 
              href="/docs" 
              className="hover:text-primary transition-colors"
            >
              文档
            </Link>
            <Link 
              href="https://github.com/yukito0209/my-personal-docs" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              源代码
            </Link>
            <Link 
              href="https://space.bilibili.com/13845177" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Bilibili
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 