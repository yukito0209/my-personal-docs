'use client';

import { useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music2, Disc } from 'lucide-react';
import Image from 'next/image';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

export function CustomMusicPlayer() {
  const {
    playlist,
    currentSong,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    audioRef,
    setCurrentSong,
    setIsPlaying,
    setVolume,
    setIsMuted,
  } = useMusicPlayer();

  const progressRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * duration;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const playNext = () => {
    if (playlist.length > 0) {
      setCurrentSong((prev) => (prev + 1) % playlist.length);
    }
  };

  const playPrevious = () => {
    if (playlist.length > 0) {
      setCurrentSong((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
  };

  if (playlist.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Music2 className="h-8 w-8 mx-auto mb-2" />
          <p>没有找到音乐文件</p>
          <p className="text-sm">请将音乐文件放入 public/music 目录</p>
        </div>
      </div>
    );
  }

  const currentTrack = playlist[currentSong];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="space-y-4 flex-shrink-0">
          {/* 专辑封面 */}
          <div className="relative pt-[100%] rounded-lg overflow-hidden bg-black/5 group">
            {currentTrack?.coverUrl ? (
              <Image
                src={currentTrack.coverUrl}
                alt={`${currentTrack.title} 封面`}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                <Disc className="w-1/3 h-1/3 text-muted-foreground animate-[spin_3s_linear_infinite]" />
              </div>
            )}
            {/* 播放按钮覆盖层 */}
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors cursor-pointer"
              onClick={togglePlay}
            >
              <button
                className="transform scale-0 group-hover:scale-100 transition-transform duration-200 p-4 rounded-full bg-white/90 text-black hover:bg-white"
                aria-label={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </button>
            </div>
          </div>

          {/* 当前播放信息 */}
          <div className="text-center space-y-1">
            <h3 className="font-medium text-lg line-clamp-1">{currentTrack?.title || '未知歌曲'}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {currentTrack?.artist || '未知艺术家'}
              {currentTrack?.album && ` · ${currentTrack.album}`}
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-auto pb-2">
          {/* 进度条和时间 */}
          <div className="space-y-1">
            <div
              ref={progressRef}
              className="relative h-1 cursor-pointer bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden group"
              onClick={handleProgressClick}
            >
              <div
                className="absolute h-full bg-primary rounded-full transition-all group-hover:bg-primary/80"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={playPrevious}
              className="p-2 hover:text-primary transition-colors"
              aria-label="上一首"
            >
              <SkipBack className="h-6 w-6" />
            </button>
            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              aria-label={isPlaying ? "暂停" : "播放"}
            >
              {isPlaying ? (
                <Pause className="h-7 w-7" />
              ) : (
                <Play className="h-7 w-7" />
              )}
            </button>
            <button
              onClick={playNext}
              className="p-2 hover:text-primary transition-colors"
              aria-label="下一首"
            >
              <SkipForward className="h-6 w-6" />
            </button>
          </div>

          {/* 音量控制 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 hover:text-primary transition-colors"
              aria-label={isMuted ? "取消静音" : "静音"}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full accent-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 