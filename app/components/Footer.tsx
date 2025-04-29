import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-card/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>© 2025</span>
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>by</span>
            <Link 
              href="https://github.com/yukito0209" 
              target="_blank"
              className="font-medium hover:text-primary transition-colors"
            >
              Yukito
            </Link>
          </div>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <Link 
              href="/docs" 
              className="hover:text-primary transition-colors"
            >
              文档
            </Link>
            <Link 
              href="https://github.com/yukito0209/my-personal-docs" 
              target="_blank"
              className="hover:text-primary transition-colors"
            >
              源代码
            </Link>
            <Link 
              href="https://space.bilibili.com/13845177" 
              target="_blank"
              className="hover:text-primary transition-colors"
            >
              视频
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 