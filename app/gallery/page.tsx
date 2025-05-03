'use client';

import Image from 'next/image';
import { Camera, Aperture, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { PhotoCard } from './components/PhotoCard';
import Link from 'next/link';
import Footer from '@/app/components/Footer';
import { useState, useCallback, useEffect } from 'react';

function GalleryHeader() {
  return (
    <div className="mb-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
          <Camera className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">我的相册</h1>
        <p className="mt-2 text-muted-foreground">
          记录生活中的美好瞬间
        </p>
      </div>
      
      <div className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="https://www.sonystyle.com.cn/products/ilc/ilce_7cm2/ilce_7cm2_feature.html"
            target="_blank"
            className="group rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 glass-effect"
          >
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Camera className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-base mb-1 group-hover:text-primary transition-colors">全画幅无反相机</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Sony Alpha 7C II
                </p>
                <div className="flex items-center text-sm text-primary">
                  <span className="group-hover:underline">查看详情</span>
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="http://sigma-photo.com.cn/lenses/overview?id=24"
            target="_blank"
            className="group rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 glass-effect"
          >
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Aperture className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-base mb-1 group-hover:text-primary transition-colors">大光圈人像定焦镜头</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Sigma 85mm F1.4 DG DN | Art
                </p>
                <div className="flex items-center text-sm text-primary">
                  <span className="group-hover:underline">查看详情</span>
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="http://sigma-photo.com.cn/lenses/overview?id=189"
            target="_blank"
            className="group rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 glass-effect"
          >
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Aperture className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-base mb-1 group-hover:text-primary transition-colors">标准变焦镜头</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Sigma 24-70mm F2.8 DG DN II | Art
                </p>
                <div className="flex items-center text-sm text-primary">
                  <span className="group-hover:underline">查看详情</span>
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="https://www.sonystyle.com.cn/products/lenses/sel40f25g/sel40f25g_feature.html"
            target="_blank"
            className="group rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50 glass-effect"
          >
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Aperture className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-base mb-1 group-hover:text-primary transition-colors">轻便定焦镜头</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Sony FE 40mm F2.5 G
                </p>
                <div className="flex items-center text-sm text-primary">
                  <span className="group-hover:underline">查看详情</span>
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function MasonryGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
      {children}
    </div>
  );
}

interface Photo {
  src: string;
  alt: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoadingError, setIsLoadingError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPhotos() {
      setIsLoading(true);
      setIsLoadingError(null);
      try {
        const response = await fetch('/api/gallery');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.photos && Array.isArray(data.photos)) {
          setPhotos(data.photos);
        } else {
          setPhotos([]);
        }
      } catch (error) {
        console.error('Error loading gallery:', error);
        setIsLoadingError(error as Error);
        setPhotos([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPhotos();
  }, []);

  const openModal = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedImageIndex(null);
  }, []);

  const showNext = useCallback(() => {
    if (selectedImageIndex === null || photos.length === 0) return;
    setSelectedImageIndex((prevIndex) => 
      prevIndex === null ? 0 : (prevIndex + 1) % photos.length
    );
  }, [selectedImageIndex, photos.length]);

  const showPrevious = useCallback(() => {
    if (selectedImageIndex === null || photos.length === 0) return;
    setSelectedImageIndex((prevIndex) =>
      prevIndex === null ? 0 : (prevIndex - 1 + photos.length) % photos.length
    );
  }, [selectedImageIndex, photos.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (event.key === 'ArrowRight') {
        showNext();
      }
      if (event.key === 'ArrowLeft') {
        showPrevious();
      }
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, showNext, showPrevious, closeModal]);

  if (isLoadingError) {
    return (
      <main className="flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-2">加载相册失败</h2>
          <p className="text-muted-foreground">请稍后重试</p>
          <p className="text-xs text-red-500 mt-2">{isLoadingError.message}</p>
        </div>
        <Footer />
      </main>
    );
  }

  const selectedPhoto = selectedImageIndex !== null ? photos[selectedImageIndex] : null;

  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-7xl">
          <GalleryHeader />
          {isLoading && (
            <div className="flex justify-center items-center h-40">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}
          {!isLoading && !isLoadingError && photos.length > 0 && (
            <MasonryGrid>
              {photos.map((photo, index) => (
                <PhotoCard 
                  key={photo.src} 
                  photo={photo} 
                  index={index}
                  openModal={openModal}
                />
              ))}
            </MasonryGrid>
          )}
          {!isLoading && !isLoadingError && photos.length === 0 && (
             <div className="text-center text-muted-foreground py-10">
               <Camera className="h-8 w-8 mx-auto mb-2" />
               <p>未能找到任何照片。</p>
               <p className="text-sm">请检查 /public/photos 目录或 API 路由。</p>
             </div>
          )}
        </div>
      </div>
      <Footer />

      {isModalOpen && selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
          onClick={closeModal}
        >
          <div 
            className="relative w-full h-full p-4 sm:p-8 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={selectedPhoto.src}
              src={selectedPhoto.src}
              alt={selectedPhoto.alt}
              fill
              sizes="100vw"
              className="object-contain animate-zoom-in"
              priority
            />
          </div>
 
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeModal();
            }}
            className="absolute right-4 top-4 sm:right-6 sm:top-6 rounded-full bg-white/10 p-2 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20"
            aria-label="关闭"
          >
            <X className="h-6 w-6 text-white" />
          </button>
 
          <button
            onClick={(e) => {
              e.stopPropagation();
              showPrevious();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-4 rounded-full bg-white/10 p-2 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="上一张"
            disabled={photos.length <= 1}
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
 
          <button
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-4 rounded-full bg-white/10 p-2 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="下一张"
            disabled={photos.length <= 1}
          >
            <ArrowRight className="h-6 w-6 text-white" />
          </button>
        </div>
      )}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(4px); }
        }
        @keyframes zoom-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-zoom-in {
          animation: zoom-in 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  );
} 