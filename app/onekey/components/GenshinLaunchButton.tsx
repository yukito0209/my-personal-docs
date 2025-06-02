'use client';

import { Gamepad2 } from 'lucide-react';

export default function GenshinLaunchButton() {
  // 播放启动音效
  const playGenshinStartupSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playNote = (frequency: number, startTime: number, duration: number, volume: number = 0.1) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // 原神启动音效序列
      const currentTime = audioContext.currentTime;
      playNote(523.25, currentTime, 0.3, 0.1); // C5
      playNote(659.25, currentTime + 0.2, 0.3, 0.1); // E5
      playNote(783.99, currentTime + 0.4, 0.5, 0.1); // G5
      playNote(1046.50, currentTime + 0.7, 0.8, 0.1); // C6
      
    } catch (error) {
      console.log('Audio playback not available');
    }
  };

  // 触发实际下载
  const triggerActualDownload = () => {
    try {
      const downloadUrl = 'https://ys-api.mihoyo.com/event/download_porter/link/ys_cn/official/pc_default';
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'yuanshen_setup.exe';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.log('下载失败');
    }
  };

  // 一键启动原神
  const handleGenshinLaunch = async () => {
    playGenshinStartupSound();
    window.open('https://ys.mihoyo.com/', '_blank');
    triggerActualDownload();

    setTimeout(() => {
      window.open('https://ys.mihoyo.com/cloud/', '_blank');
    }, 1000);

    setTimeout(() => {
      const randomVideos = [
        'https://www.bilibili.com/video/BV1a14y1i7N4/',
        // 'https://www.bilibili.com/video/BV1GJ411x7h7/',
      ];
      const randomVideo = randomVideos[Math.floor(Math.random() * randomVideos.length)];
      window.open(randomVideo, '_blank');
    }, 2000);
  };

  return (
    <button
      onClick={handleGenshinLaunch}
      className="group relative p-6 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:scale-110 hover:shadow-lg glass-effect"
      title="???"
    >
      <Gamepad2 className="h-8 w-8 text-primary group-hover:text-primary transition-colors duration-300" />
    </button>
  );
} 