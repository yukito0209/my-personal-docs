'use client';

import { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music2, Disc, AlertCircle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

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

export function CustomMusicPlayer() {
  const {
    playlist,
    currentSong,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    isLoading,
    error,
    audioRef,
    setCurrentSong,
    setIsPlaying,
    setVolume,
    setIsMuted,
    setCurrentTime,
    setDuration
  } = useMusicPlayer();

  const progressRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [isHovering, setIsHovering] = useState(false);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [componentError, setComponentError] = useState<Error | null>(null);

  // 重置组件错误状态
  const resetError = () => {
    setComponentError(null);
    // 重新加载当前歌曲
    if (audioRef.current && playlist[currentSong]) {
      const audio = audioRef.current;
      audio.src = playlist[currentSong].src;
      audio.load();
      setIsPlaying(false);
    }
  };

  // 错误处理包装函数
  const withErrorHandling = (fn: (...args: any[]) => any) => {
    return (...args: any[]) => {
      try {
        return fn(...args);
      } catch (error) {
        console.error('播放器组件错误:', error);
        setComponentError(error as Error);
        return undefined;
      }
    };
  };

  // 同步本地时间与上下文时间
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalCurrentTime(currentTime);
    }
  }, [currentTime]);

  // 当歌曲变化时重置封面加载状态
  useEffect(() => {
    setCoverLoaded(false);
  }, [currentSong]);

  const handleProgressDragStart = withErrorHandling((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault(); // 防止文本选择
    isDraggingRef.current = true;
    handleProgressDrag(e);
  });

  const handleProgressDrag = withErrorHandling((e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (isDraggingRef.current && progressRef.current) {
      e.preventDefault(); // 防止文本选择
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const newTime = percent * duration;
      setLocalCurrentTime(newTime);
    }
  });

  const handleProgressDragEnd = withErrorHandling(() => {
    if (isDraggingRef.current && audioRef.current) {
      audioRef.current.currentTime = localCurrentTime;
      setCurrentTime(localCurrentTime);
      isDraggingRef.current = false;
    }
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault();
        handleProgressDrag(e);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        handleProgressDragEnd();
      }
    };

    if (isDraggingRef.current) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [duration, localCurrentTime]);

  const handleProgressClick = withErrorHandling((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault(); // 防止文本选择
    if (progressRef.current && audioRef.current && !isDraggingRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const newTime = percent * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setLocalCurrentTime(newTime);
    }
  });

  const togglePlay = withErrorHandling(async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          await audioRef.current.pause();
          // 保存当前时间位置，不做任何修改
          setIsPlaying(false);
        } else {
          // 保持当前时间位置，不重置
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            setIsPlaying(true);
          }
        }
      } catch (error) {
        console.error('Error toggling play state:', error);
        setIsPlaying(false);
      }
    }
  });

  const toggleMute = withErrorHandling(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  });

  const formatTime = (time: number) => {
    if (!isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const remainingSeconds = Math.floor(time % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const playNext = withErrorHandling(() => {
    if (playlist.length > 0) {
      setCurrentSong((prev) => (prev + 1) % playlist.length);
    }
  });

  const playPrevious = withErrorHandling(() => {
    if (playlist.length > 0) {
      setCurrentSong((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
  });

  // 错误格式化
  const getErrorMessage = (error: MediaError | null) => {
    if (!error) return '';
    
    const errorMessages: Record<number, string> = {
      1: '加载被中止',
      2: '网络错误',
      3: '解码错误',
      4: '音频格式不支持'
    };
    
    return errorMessages[error.code] || '未知错误';
  };

  // 监听歌曲变化
  useEffect(() => {
    if (audioRef.current && playlist[currentSong]?.src) {
      const audio = audioRef.current;
      const wasPlaying = isPlaying;
      
      audio.src = playlist[currentSong].src;
      audio.load();
      
      const setupAudio = async () => {
        try {
          // 等待音频加载完成
          await new Promise((resolve) => {
            const handleCanPlay = () => {
              audio.removeEventListener('canplay', handleCanPlay);
              resolve(true);
            };
            
            if (audio.readyState >= 3) {
              resolve(true);
            } else {
              audio.addEventListener('canplay', handleCanPlay);
            }
          });
          
          // 新歌曲从头开始播放
          audio.currentTime = 0;
          setCurrentTime(0);
          setLocalCurrentTime(0);
          
          // 如果之前在播放，则继续播放
          if (wasPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              await playPromise;
            }
          }
        } catch (error) {
          console.error('Error setting up audio:', error);
          setIsPlaying(false);
        }
      };
      
      setupAudio();
    }
  }, [currentSong, playlist]);

  // 添加错误处理
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const handleError = (error: Event) => {
        console.error('Audio error:', error, audio.error);
        setIsPlaying(false);
      };
      audio.addEventListener('error', handleError);
      return () => {
        audio.removeEventListener('error', handleError);
      };
    }
  }, []);

  // 更新音频时间
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const updateTime = () => {
      if (!isDraggingRef.current) {
        setCurrentTime(audio.currentTime);
        setLocalCurrentTime(audio.currentTime);
        setDuration(audio.duration || 0);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
      setLocalCurrentTime(audio.currentTime);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', () => setDuration(audio.duration || 0));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', () => setDuration(audio.duration || 0));
    };
  }, []);

  // 计算进度条宽度 - 使用本地时间以响应拖动
  const progressWidth = duration > 0 ? (localCurrentTime / duration) * 100 : 0;

  // 如果组件内部发生错误，显示错误处理界面
  if (componentError) {
    return <ErrorFallback error={componentError} resetErrorBoundary={resetError} />;
  }

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
    <div className="h-full flex flex-col select-none">
      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="space-y-4 flex-shrink-0">
          {/* 专辑封面 */}
          <div className="relative pt-[100%] rounded-lg overflow-hidden bg-black/5 group">
            {/* 错误显示 */}
            {error && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 text-white p-4">
                <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                <p className="font-medium text-center">播放错误</p>
                <p className="text-sm text-center mt-1">{getErrorMessage(error)}</p>
                <button 
                  onClick={() => {
                    // 重置当前歌曲
                    if (audioRef.current) {
                      audioRef.current.load();
                    }
                  }}
                  className="mt-4 flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm"
                >
                  <RefreshCw className="h-3 w-3" /> 
                  重试
                </button>
              </div>
            )}
            
            {/* 加载中显示 */}
            {isLoading && !error && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
              </div>
            )}
            
            {currentTrack?.coverUrl ? (
              <>
                {/* 图片加载指示器 - 只在图片未加载时显示 */}
                {!coverLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                )}
                <Image
                  src={currentTrack.coverUrl}
                  alt={`${currentTrack.title} 封面`}
                  fill
                  className={`object-cover transition-all duration-300 group-hover:scale-105 ${coverLoaded ? 'opacity-100' : 'opacity-0'}`}
                  priority
                  unoptimized
                  onError={(e) => {
                    console.error('Error loading cover image:', e);
                    e.currentTarget.style.display = 'none';
                    setCoverLoaded(true); // 即使有错误也标记为已加载，以移除加载指示器
                  }}
                  onLoad={() => {
                    setCoverLoaded(true);
                  }}
                />
              </>
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
          <div className="space-y-1.5 px-1">
            <div
              ref={progressRef}
              className="group relative h-1 cursor-pointer rounded-full overflow-visible transition-all duration-200 touch-none"
              onClick={handleProgressClick}
              onMouseDown={handleProgressDragStart}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* 进度条背景 */}
              <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700">
                {/* 已播放部分 */}
                <div
                  className="absolute inset-0 rounded-full bg-[#1f66f4] transition-all duration-200"
                  style={{ width: `${progressWidth}%` }}
                />
                {/* 悬停效果 - 未播放部分 */}
                <div
                  className="absolute inset-0 rounded-full bg-gray-300 dark:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ left: `${progressWidth}%` }}
                />
              </div>
              {/* 拖动点 */}
              <div
                className={`absolute w-3 h-3 top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-200 will-change-transform ${
                  isDraggingRef.current ? 'scale-110' : 'scale-100'
                }`}
                style={{
                  left: `${progressWidth}%`,
                }}
              >
                {/* 拖动点内圈 */}
                <div className="absolute inset-0 rounded-full bg-white dark:bg-gray-900 shadow-lg" />
                {/* 拖动点外圈 */}
                <div className={`absolute inset-[-2px] rounded-full bg-[#1f66f4] opacity-30 ${
                  isDraggingRef.current ? 'animate-ping' : ''
                }`} />
                {/* 拖动点装饰圈 */}
                <div className="absolute inset-[-4px] rounded-full bg-[#1f66f4]/20" />
              </div>
              {/* 扩大可点击区域 */}
              <div className="absolute inset-y-0 w-full -left-1 right-1">
                <div className="absolute inset-y-[-8px] inset-x-[-8px] cursor-pointer" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>{formatTime(localCurrentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={playPrevious}
              className="p-2 hover:text-primary transition-colors"
              aria-label="上一首"
              disabled={isLoading}
            >
              <SkipBack className={`h-6 w-6 ${isLoading ? 'opacity-50' : ''}`} />
            </button>
            <button
              onClick={togglePlay}
              className={`p-4 rounded-full ${
                isLoading 
                  ? 'bg-gray-200 dark:bg-gray-700 text-muted-foreground cursor-wait' 
                  : 'bg-primary/10 hover:bg-primary/20 text-primary'
              } transition-colors`}
              aria-label={isPlaying ? "暂停" : "播放"}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="h-7 w-7" />
              ) : (
                <Play className="h-7 w-7" />
              )}
            </button>
            <button
              onClick={playNext}
              className="p-2 hover:text-primary transition-colors"
              aria-label="下一首"
              disabled={isLoading}
            >
              <SkipForward className={`h-6 w-6 ${isLoading ? 'opacity-50' : ''}`} />
            </button>
          </div>

          {/* 音量控制 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 hover:text-[#1f66f4] transition-colors"
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
              className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full accent-[#1f66f4]"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 