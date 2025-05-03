'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Photo {
  src: string;
  alt: string;
}

interface PhotoCardProps {
  photo: Photo;
  index: number;
  openModal: (index: number) => void;
}

export function PhotoCard({ photo, index, openModal }: PhotoCardProps) {
  const [aspectRatio, setAspectRatio] = useState('1');
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const card = cardRef.current;
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const maxRotate = 15;
    const rotateY = ((x - centerX) / centerX) * maxRotate;
    const rotateX = -((y - centerY) / centerY) * maxRotate;
    const scale = 1.03;
    
    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
    card.style.setProperty('--scale', `${scale}`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
    card.style.setProperty('--scale', '1');
  };

  useEffect(() => {
    setIsLoading(true);
    const img = new window.Image();
    img.src = photo.src;
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
      }
      setIsLoading(false);
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${photo.src}`);
      setIsLoading(false);
      setAspectRatio('1');
    }
  }, [photo.src]);

  return (
    <div className="mb-4 break-inside-avoid">
      <div
        ref={cardRef}
        className="tilt-card group relative overflow-hidden rounded-lg cursor-pointer will-change-transform"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => openModal(index)}
      >
        <div
          className="relative w-full"
          style={{
            aspectRatio: aspectRatio,
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
          )}
          <Image
            ref={imageRef}
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => {
              if (isLoading) setIsLoading(false);
            }}
            onError={() => {
              if (isLoading) setIsLoading(false);
            }}
            priority={index < 12}
          />
        </div>
      </div>
    </div>
  );
}