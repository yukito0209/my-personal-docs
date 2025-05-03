'use client';

import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full flex items-center justify-center 
                 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700
                 transition-all duration-300 ease-in-out
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 shadow-sm hover:shadow-md
                 group"
      aria-label="切换主题"
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute w-5 h-5 text-yellow-500 transition-all duration-300 ease-in-out
                     ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
        />
        <Moon
          className={`absolute w-5 h-5 text-blue-400 transition-all duration-300 ease-in-out
                     ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'}`}
        />
      </div>
    </button>
  );
} 