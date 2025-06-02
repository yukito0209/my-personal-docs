'use client';

import Footer from '@/app/components/Footer';
import GenshinLaunchButton from './components/GenshinLaunchButton';

export default function OneKeyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex-1 flex items-center justify-center">
        <GenshinLaunchButton />
      </div>
      <Footer />
    </main>
  );
} 