import Image from 'next/image';
import { Camera, Aperture, ArrowRight } from 'lucide-react';
import { PhotoCard } from './components/PhotoCard';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

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
            className="group rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50"
          >
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Camera className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-base mb-1 group-hover:text-primary transition-colors">全画幅无反相机</h3>
                <p className="text-sm text-muted-foreground mb-2">
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
            className="group rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50"
          >
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Aperture className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-base mb-1 group-hover:text-primary transition-colors">大光圈人像定焦镜头</h3>
                <p className="text-sm text-muted-foreground mb-2">
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
            className="group rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50"
          >
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Aperture className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-base mb-1 group-hover:text-primary transition-colors">标准变焦镜头</h3>
                <p className="text-sm text-muted-foreground mb-2">
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
            className="group rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/50"
          >
            <div className="flex items-start space-x-4">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Aperture className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-base mb-1 group-hover:text-primary transition-colors">轻便定焦镜头</h3>
                <p className="text-sm text-muted-foreground mb-2">
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

export default async function GalleryPage() {
  try {
    const photosDir = path.join(process.cwd(), 'public', 'photos');
    const files = fs.readdirSync(photosDir)
      .filter(file => !file.startsWith('.') && (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png')));
    
    const photos = files.map(file => ({
      src: `/photos/${file}`,
      alt: file.split('.')[0]
    }));

    return (
      <main className="flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-7xl">
          <GalleryHeader />
          <MasonryGrid>
            {photos.map((photo, index) => (
              <PhotoCard key={photo.src} photo={photo} />
            ))}
          </MasonryGrid>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading gallery:', error);
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-semibold mb-2">加载相册失败</h2>
        <p className="text-muted-foreground">请稍后重试</p>
      </div>
    );
  }
} 