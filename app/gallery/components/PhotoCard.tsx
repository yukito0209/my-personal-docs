'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Photo {
  src: string;
  alt: string;
}

export function PhotoCard({ photo }: { photo: Photo }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1');
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const card = cardRef.current;
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const maxRotate = 16;
    const rotateY = ((x - centerX) / centerX) * maxRotate;
    const rotateX = -((y - centerY) / centerY) * maxRotate;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)');
  };

  useEffect(() => {
    const img = new window.Image();
    img.src = photo.src;
    img.onload = () => {
      setAspectRatio(`${img.width}/${img.height}`);
      setIsLoading(false);
    };
  }, [photo.src]);

  return (
    <>
      <div className="mb-4 break-inside-avoid">
        <div
          ref={cardRef}
          className="group relative overflow-hidden rounded-lg transition-transform duration-150 will-change-transform"
          style={{ transform, animationDuration: '0.125s' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="relative w-full"
            style={{
              aspectRatio: aspectRatio,
            }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            )}
            <Image
              ref={imageRef}
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-all duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100 group-hover:scale-105'
              }`}
              onLoad={() => setIsLoading(false)}
            />
          </div>

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => setIsFullscreen(true)}
                className="flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
              >
                <span className="text-sm mr-1 text-white">查看</span>
                <ArrowUpRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative w-full h-full p-4">
            <div className="relative w-full h-full">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(false);
              }}
              className="absolute right-6 top-6 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-transform duration-300 hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}