'use client';

import Image from 'next/image';
import { Camera } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getPhotoUrl } from '@/app/utils/oss';

interface Photo {
  src: string;
  alt: string;
}

export function PhotoCard({ photo }: { photo: Photo }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1');
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const photoUrl = getPhotoUrl(photo.src);

  useEffect(() => {
    const img = new window.Image();
    img.src = photoUrl;
    img.onload = () => {
      setAspectRatio(`${img.width}/${img.height}`);
      setIsLoading(false);
    };
  }, [photoUrl]);

  return (
    <>
      <div className="mb-4 break-inside-avoid">
        <div className="group relative overflow-hidden rounded-lg">
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
              src={photoUrl}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-all duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100 group-hover:scale-105'
              }`}
              onLoad={() => setIsLoading(false)}
            />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={() => setIsFullscreen(true)}
              className="rounded-full bg-white/20 p-2 backdrop-blur-sm transition-transform duration-300 hover:scale-110"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
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
                src={photoUrl}
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