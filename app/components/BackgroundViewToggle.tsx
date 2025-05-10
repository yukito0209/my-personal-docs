'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function BackgroundViewToggle() {
  const [isBackgroundOnly, setIsBackgroundOnly] = useState(false);

  useEffect(() => {
    const mainContentWrapper = document.getElementById('main-content-wrapper');

    if (mainContentWrapper) {
      if (isBackgroundOnly) {
        mainContentWrapper.style.opacity = '0';
        mainContentWrapper.style.pointerEvents = 'none';
      } else {
        mainContentWrapper.style.opacity = '1';
        mainContentWrapper.style.pointerEvents = 'auto';
      }
    }
  }, [isBackgroundOnly]);

  return (
    <button
      onClick={() => setIsBackgroundOnly(!isBackgroundOnly)}
      className="relative w-10 h-10 rounded-full flex items-center justify-center 
                 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700
                 transition-all duration-300 ease-in-out
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 shadow-sm hover:shadow-md"
      aria-label={isBackgroundOnly ? "显示页面内容" : "查看背景图"}
      title={isBackgroundOnly ? "显示页面内容" : "查看背景图"}
    >
      <div className="relative w-5 h-5">
        <Eye
          className={`absolute w-5 h-5 text-blue-500 transition-all duration-300 ease-in-out
                     ${isBackgroundOnly ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
        />
        <EyeOff
          className={`absolute w-5 h-5 text-gray-500 transition-all duration-300 ease-in-out
                     ${!isBackgroundOnly ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'}`}
        />
      </div>
    </button>
  );
} 