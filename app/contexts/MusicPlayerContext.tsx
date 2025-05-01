'use client';

import { createContext, useContext, useState, useRef, useEffect } from 'react';

interface Song {
  title: string;
  artist: string;
  src: string;
  coverUrl?: string;
  album?: string;
}

interface MusicPlayerContextType {
  playlist: Song[];
  currentSong: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: MediaError | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  setPlaylist: (songs: Song[]) => void;
  setCurrentSong: (indexOrUpdater: number | ((prev: number) => number)) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<MediaError | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const wasPlayingRef = useRef(false);

  // 初始化状态
  useEffect(() => {
    // 从 localStorage 恢复状态
    const savedPlaylist = localStorage.getItem('musicPlayer_playlist');
    const savedCurrentSong = localStorage.getItem('musicPlayer_currentSong');
    const savedIsPlaying = localStorage.getItem('musicPlayer_isPlaying');
    const savedVolume = localStorage.getItem('musicPlayer_volume');
    const savedIsMuted = localStorage.getItem('musicPlayer_isMuted');
    const savedCurrentTime = localStorage.getItem('musicPlayer_currentTime');

    if (savedPlaylist) {
      setPlaylist(JSON.parse(savedPlaylist));
    }
    if (savedCurrentSong) {
      setCurrentSong(parseInt(savedCurrentSong));
    }
    if (savedIsPlaying) {
      setIsPlaying(savedIsPlaying === 'true');
      wasPlayingRef.current = savedIsPlaying === 'true';
    }
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
    if (savedIsMuted) {
      setIsMuted(savedIsMuted === 'true');
    }
    if (savedCurrentTime) {
      setCurrentTime(parseFloat(savedCurrentTime));
    }

    setIsInitialized(true);
  }, []);

  // 保存状态到 localStorage
  useEffect(() => {
    if (!isInitialized) return;
    
    localStorage.setItem('musicPlayer_playlist', JSON.stringify(playlist));
    localStorage.setItem('musicPlayer_currentSong', currentSong.toString());
    localStorage.setItem('musicPlayer_isPlaying', isPlaying.toString());
    localStorage.setItem('musicPlayer_volume', volume.toString());
    localStorage.setItem('musicPlayer_isMuted', isMuted.toString());
    localStorage.setItem('musicPlayer_currentTime', currentTime.toString());
  }, [playlist, currentSong, isPlaying, volume, isMuted, currentTime, isInitialized]);

  // 监听页面可见性变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && wasPlayingRef.current) {
        // 页面重新可见时，如果之前是播放状态，则继续播放
        setIsPlaying(true);
      } else if (document.visibilityState === 'hidden') {
        // 页面隐藏时，记录播放状态
        wasPlayingRef.current = isPlaying;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  // 初始化音乐列表
  useEffect(() => {
    if (!isInitialized) return;

    async function loadMusic() {
      try {
        const response = await fetch('/api/music');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.files) {
          const processedFiles = await Promise.all(data.files.map(async (file: Song) => {
            // 验证封面 URL
            let coverUrl = file.coverUrl;
            if (coverUrl) {
              try {
                const response = await fetch(coverUrl, { method: 'HEAD' });
                if (!response.ok) {
                  console.warn(`Cover image not found: ${coverUrl}`);
                  coverUrl = undefined;
                }
              } catch (error) {
                console.warn(`Error validating cover URL: ${coverUrl}`, error);
                coverUrl = undefined;
              }
            }
            
            return {
              ...file,
              src: file.src,
              coverUrl
            };
          }));
          
          console.log('Processed music files:', processedFiles);
          setPlaylist(processedFiles);
        }
      } catch (error) {
        console.error('Error loading music:', error);
      }
    }

    loadMusic();
  }, [isInitialized]);

  // 监听音频状态变化
  useEffect(() => {
    if (!audioRef.current || !isInitialized) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
      setIsLoading(false);
    };

    const handleEnded = () => {
      if (playlist.length > 0) {
        setCurrentSong((prev) => (prev + 1) % playlist.length);
      }
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [playlist.length, isInitialized]);

  // 监听播放状态变化
  useEffect(() => {
    if (!audioRef.current || !isInitialized) return;
    
    const audio = audioRef.current;
    
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // 忽略用户未交互导致的自动播放错误
          if (error.name === 'NotAllowedError') {
            console.log('Autoplay prevented, waiting for user interaction');
            setIsPlaying(false);
            return;
          }
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, isInitialized]);

  // 监听音量变化
  useEffect(() => {
    if (!audioRef.current || !isInitialized) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted, isInitialized]);

  // 监听当前歌曲变化
  useEffect(() => {
    if (!audioRef.current || !playlist[currentSong] || !isInitialized) return;
    
    const audio = audioRef.current;
    const currentTrack = playlist[currentSong];
    
    const loadAndPlay = async () => {
      try {
        setIsLoading(true);
        setError(null);
        audio.src = currentTrack.src;
        await audio.load();
        
        // 恢复之前的播放位置
        const savedCurrentTime = localStorage.getItem('musicPlayer_currentTime');
        if (savedCurrentTime) {
          audio.currentTime = parseFloat(savedCurrentTime);
        }
        
        if (isPlaying) {
          try {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              await playPromise;
            }
          } catch (error) {
            // 忽略用户未交互导致的自动播放错误
            if (error instanceof Error && error.name === 'NotAllowedError') {
              console.log('Autoplay prevented, waiting for user interaction');
              setIsPlaying(false);
              return;
            }
            throw error;
          }
        }
      } catch (error) {
        console.error('Error loading audio:', error);
        setError(audio.error);
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAndPlay();
  }, [currentSong, playlist, isPlaying, isInitialized]);

  // 添加用户交互监听
  useEffect(() => {
    const handleUserInteraction = () => {
      // 用户交互后，如果之前是播放状态，则尝试恢复播放
      if (wasPlayingRef.current) {
        setIsPlaying(true);
      }
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const value = {
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
    setPlaylist,
    setCurrentSong,
    setIsPlaying,
    setVolume,
    setIsMuted,
    setCurrentTime,
    setDuration
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="auto"
      />
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}

// 添加封面 URL 验证函数
async function validateCoverUrl(urls: string[]): Promise<string | undefined> {
  try {
    // 尝试所有可能的 URL
    for (const url of urls) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          console.log(`Found valid cover image at ${url}`);
          return url;
        }
      } catch (error) {
        console.warn(`Failed to check URL ${url}:`, error);
        continue;
      }
    }
    console.warn(`No valid cover image found in URLs:`, urls);
    return undefined;
  } catch (error) {
    console.error(`Error validating cover URLs:`, error);
    return undefined;
  }
} 