'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music2, Disc, AlertCircle, RefreshCw, ListMusic, X } from 'lucide-react';
import Image from 'next/image';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

interface Song {
  title: string;
  artist: string;
  src: string;
  coverUrl?: string;
  album?: string;
}

// 简单错误边界组件
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-4">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-xl font-bold mb-2">播放器出现问题</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {error.message || '播放音乐时遇到了意外错误'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
      >
        <RefreshCw className="h-4 w-4" />
        刷新播放器
      </button>
    </div>
  );
}

// Memoized 组件用于显示歌曲信息
const SongInfoDisplay = React.memo(({ title, artist, album }: { title?: string, artist?: string, album?: string }) => {
  console.log("Rendering SongInfoDisplay"); // 添加日志检查渲染
  return (
    <div className="text-center space-y-1">
      <h3 className="font-medium text-lg line-clamp-1">{title || '未知歌曲'}</h3>
      <p className="text-sm text-muted-foreground line-clamp-1">
        {artist || '未知艺术家'}
        {album && ` · ${album}`}
      </p>
    </div>
  );
});
SongInfoDisplay.displayName = 'SongInfoDisplay'; // 设置 displayName

export function CustomMusicPlayer() {
  // --- Get state and controls from Context ---
  const {
    playlist,
    currentSongIndex,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    isLoading,
    error,
    currentTrack,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    playSongAtIndex,
  } = useMusicPlayer();

  // --- Local UI State & Refs ---
  const progressRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [localCurrentTime, setLocalCurrentTime] = useState(0); // For smooth dragging display
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [componentError, setComponentError] = useState<Error | null>(null); // For UI-specific errors
  const [isPlaylistViewOpen, setIsPlaylistViewOpen] = useState(false); // State for view toggle

  // --- Helper Functions (mostly unchanged, operate on context data) ---
  const formatTime = (time: number): string => {
    if (!isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const remainingSeconds = Math.floor(time % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getErrorMessage = (err: MediaError | null): string => {
    if (!err) return '';
    const errorMessages: Record<number, string> = {
      1: '加载被中止', 2: '网络错误', 3: '解码错误', 4: '音频格式不支持'
    };
    return errorMessages[err.code] || '未知错误';
  };

  // --- Effects for Local UI State ---

  // Reset cover loaded state when track changes
  useEffect(() => {
    setCoverLoaded(false);
  }, [currentTrack?.src]); // Depend on src to detect track change

  // Sync local time display with context time, unless dragging
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalCurrentTime(currentTime);
    }
  }, [currentTime]);

  // --- Event Handlers (Call context functions) ---

   // Error handling wrapper (simpler version for UI interactions)
  const withErrorHandling = <T extends (...args: any[]) => any>(
    fn: T
  ): ((...args: Parameters<T>) => ReturnType<T> | void) => {
    return (...args: Parameters<T>) => {
      try {
        // Call the function passed from the context (which should have its own error handling)
        return fn(...args); 
      } catch (err) {
        console.error('UI component error during action:', err);
        setComponentError(err as Error);
      }
    };
  };

  const handleTogglePlay = withErrorHandling(togglePlay);
  const handlePlayNext = withErrorHandling(playNext);
  const handlePlayPrevious = withErrorHandling(playPrevious);
  const handleToggleMute = withErrorHandling(toggleMute);
  
  const handleVolumeChange = withErrorHandling((e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  });

  // Progress bar interactions call the context 'seek' function
  const handleProgressClick = withErrorHandling((e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      seek(percent * duration); // Call context's seek
      setLocalCurrentTime(percent * duration); // Update local UI immediately
    }
  });

  const handleProgressDragStart = withErrorHandling((e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    e.preventDefault();
    isDraggingRef.current = true;
    if (progressRef.current) {
        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        setLocalCurrentTime(percent * duration);
    }
  });

  const handleProgressDrag = useCallback((e: MouseEvent) => {
    if (isDraggingRef.current && progressRef.current && duration > 0) {
      e.preventDefault();
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      setLocalCurrentTime(percent * duration); // Only update local time during drag
    }
  }, [duration]);

  const handleProgressDragEnd = useCallback(() => {
    if (isDraggingRef.current) {
        isDraggingRef.current = false;
        seek(localCurrentTime); // Seek to the final position using context function
    }
  }, [seek, localCurrentTime]);

  // Add/remove global listeners for dragging outside the bar
  useEffect(() => {
    if (!isDraggingRef.current) return;
    window.addEventListener('mousemove', handleProgressDrag);
    window.addEventListener('mouseup', handleProgressDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleProgressDrag);
      window.removeEventListener('mouseup', handleProgressDragEnd);
    };
  }, [isDraggingRef.current, handleProgressDrag, handleProgressDragEnd]);

  // Reset local component error (may need a way to trigger context reset if needed)
  const resetError = () => {
    setComponentError(null);
    // Note: Resetting context error state might require a dedicated context function
  };

  // --- Render Logic ---
  const progressWidth = duration > 0 ? (localCurrentTime / duration) * 100 : 0;

  if (componentError) {
    // Provide a way to reset the local error state
    return <ErrorFallback error={componentError} resetErrorBoundary={resetError} />;
  }

  // Display loading or no music message based on context state
  if (playlist.length === 0 && isLoading) {
     return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="h-8 w-8 mx-auto mb-2 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p>正在加载播放列表...</p>
        </div>
      </div>
    );
  }
  
   if (playlist.length === 0 && !isLoading) {
     return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
           <Music2 className="h-8 w-8 mx-auto mb-2" />
           <p>没有找到音乐文件</p>
           <p className="text-sm">请检查 public/music 目录</p>
        </div>
      </div>
    );
  }

  // Main Player UI
  return (
    <div className="h-full flex flex-col select-none">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div 
          className={`absolute inset-0 transition-all duration-300 ease-in-out flex flex-col justify-between ${ 
            isPlaylistViewOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          <div className="space-y-4 flex-shrink-0 p-4 pt-0">
          <div className="relative pt-[100%] rounded-lg overflow-hidden bg-black/5 group">
            {error && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 text-white p-4">
                <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                <p className="font-medium text-center">播放错误</p>
                <p className="text-sm text-center mt-1">{getErrorMessage(error)}</p>
                 <button 
                    onClick={resetError}
                  className="mt-4 flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm"
                >
                  <RefreshCw className="h-3 w-3" /> 
                  重试
                </button>
              </div>
            )}
            {isLoading && !error && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
              </div>
            )}
             {currentTrack?.coverUrl ? (
              <>
                {!coverLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                )}
                <Image
                  key={currentTrack.src} 
                  src={currentTrack.coverUrl}
                  alt={`${currentTrack.title} 封面`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={`object-cover ${coverLoaded ? 'opacity-100' : 'opacity-0'} 
                             transition-all duration-300 ease-in-out 
                             group-hover:scale-105 group-hover:brightness-110`}
                  priority
                  unoptimized
                  onError={() => setCoverLoaded(true)} 
                  onLoad={() => setCoverLoaded(true)}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                <Disc className="w-1/3 h-1/3 text-muted-foreground animate-[spin_3s_linear_infinite]" />
              </div>
            )}
              {!isLoading && !error && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors cursor-pointer group-hover:opacity-100 opacity-0"
                  onClick={handleTogglePlay}
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
              )}
          </div>
          <SongInfoDisplay
            title={currentTrack?.title}
            artist={currentTrack?.artist}
            album={currentTrack?.album}
          />
          </div>
        </div>

        <div 
          className={`absolute inset-0 flex flex-col transition-all duration-300 ease-in-out p-4 pt-0 ${ 
            isPlaylistViewOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between mb-2 flex-shrink-0 pt-4">
            <h3 className="font-medium text-base">播放列表 ({playlist.length})</h3>
          </div>
          <ul className="flex-1 overflow-y-auto space-y-1 pr-1">
            {playlist.map((song, index) => (
              <li 
                key={song.src + index}
                onClick={() => playSongAtIndex(index)}
                className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${ 
                  index === currentSongIndex ? 'bg-primary/10 text-primary' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex-shrink-0 w-5 text-center">
                  {index === currentSongIndex && isPlaying ? (
                     <Pause size={14} className="animate-pulse text-primary"/>
                  ) : index === currentSongIndex ? (
                     <Play size={14} className="text-primary"/>
                  ) : (
                     <span className="text-xs text-muted-foreground w-full inline-block">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${index === currentSongIndex ? 'text-primary' : ''}`}>{song.title}</p>
                  <p className={`text-xs truncate ${index === currentSongIndex ? 'text-primary/80' : 'text-muted-foreground'}`}>{song.artist}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4 p-4 relative z-10 bg-card/80 backdrop-blur-sm rounded-lg">
        <div className="space-y-1.5">
           <div ref={progressRef} className="group relative h-1 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700 touch-none" onClick={handleProgressClick} onMouseDown={handleProgressDragStart}>
              <div
               className="absolute inset-0 rounded-full" 
               style={{ 
                 backgroundColor: 'hsl(var(--primary))',
                 width: `${progressWidth}%` 
               }} 
              />
             <div className="absolute w-3 h-3 bg-white dark:bg-gray-900 rounded-full shadow-md top-1/2 -translate-y-1/2 -translate-x-1/2 border-2 border-primary transition-transform duration-150 group-hover:scale-110" style={{ left: `${progressWidth}%` }} />
               <div className="absolute inset-y-[-8px] inset-x-[-4px]" /> 
            </div>
           <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(localCurrentTime)}</span> 
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-6">
           <button onClick={handlePlayPrevious} className="p-2 hover:text-primary disabled:opacity-50" aria-label="上一首" disabled={isLoading || playlist.length <= 1}><SkipBack className="h-6 w-6" /></button>
           <button onClick={handleTogglePlay} className={`p-3 rounded-full ${isLoading ? 'bg-gray-200 dark:bg-gray-700 text-muted-foreground cursor-wait' : 'bg-primary/10 hover:bg-primary/20 text-primary'} transition-[background-color] duration-150`} aria-label={isPlaying ? "暂停" : "播放"} disabled={isLoading && !error}>
             {isLoading && !error ? <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" /> : isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
           <button onClick={handlePlayNext} className="p-2 hover:text-primary disabled:opacity-50" aria-label="下一首" disabled={isLoading || playlist.length <= 1}><SkipForward className="h-6 w-6" /></button>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleToggleMute} className="p-1.5 hover:text-primary" aria-label={isMuted ? "取消静音" : "静音"}>
            {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full accent-primary cursor-pointer" style={{ accentColor: 'hsl(var(--primary))' }} aria-label="音量控制" />
            <button
            onClick={() => setIsPlaylistViewOpen(!isPlaylistViewOpen)}
            className={`p-1.5 rounded-md ${isPlaylistViewOpen ? 'bg-primary/10 text-primary' : 'hover:text-primary'} transition-[background-color] duration-150`}
            aria-label={isPlaylistViewOpen ? "关闭播放列表" : "打开播放列表"}
            >
            {isPlaylistViewOpen ? <X className="h-5 w-5" /> : <ListMusic className="h-5 w-5" />}
            </button>
        </div>
      </div>
    </div>
  );
} 