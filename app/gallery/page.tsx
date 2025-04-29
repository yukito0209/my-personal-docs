import Image from 'next/image';
import { Camera } from 'lucide-react';
import { PhotoCard } from './components/PhotoCard';
import { getPhotos } from './utils/photos';

function GalleryHeader() {
  return (
    <div className="mb-8 text-center">
      <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
        <Camera className="h-6 w-6 text-primary" />
      </div>
      <h1 className="mt-4 text-2xl font-bold">我的相册</h1>
      <p className="mt-2 text-muted-foreground">
        记录生活中的美好瞬间
      </p>
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

export default function GalleryPage() {
  // 获取所有照片
  const photos = getPhotos();

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
} 