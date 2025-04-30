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

  // 初始化音乐列表
  useEffect(() => {
    async function loadMusic() {
      try {
        const response = await fetch('/api/music');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.files) {
          const processedFiles = data.files.map((file: Song) => ({
            ...file,
            src: file.src
          }));
          console.log('Processed music files:', processedFiles);
          setPlaylist(processedFiles);
        }
      } catch (error) {
        console.error('Error loading music:', error);
      }
    }

    loadMusic();
  }, []);

  // 监听音频状态变化
  useEffect(() => {
    if (!audioRef.current) return;

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
    audio.addEventListener('playing', () => setIsLoading(false));
    audio.addEventListener('waiting', () => setIsLoading(true));

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', () => setIsLoading(false));
      audio.removeEventListener('waiting', () => setIsLoading(true));
    };
  }, [playlist.length]);

  // 监听音量变化
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // 监听歌曲变化
  useEffect(() => {
    if (!audioRef.current || !playlist[currentSong]) return;

    const audio = audioRef.current;
    const currentTrack = playlist[currentSong];

    const loadAndPlay = async () => {
      try {
        setIsLoading(true);
        setError(null);
        audio.src = currentTrack.src;
        await audio.load();
        
        if (isPlaying) {
          try {
            await audio.play();
          } catch (error) {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
          }
        }
      } catch (error) {
        console.error('Error loading audio:', error);
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadAndPlay();
  }, [currentSong, playlist]);

  // 监听播放状态变化
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    if (isPlaying) {
      // 避免重复播放导致的错误
      if (audio.paused) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Error on auto-play:', error);
            setIsPlaying(false);
          });
        }
      }
    } else {
      // 避免重复暂停导致的错误
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [isPlaying]);

  // 添加音频错误处理
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const handleError = (event: Event) => {
      const mediaError = audio.error;
      setError(mediaError);
      console.error('Audio error:', {
        code: mediaError?.code,
        message: mediaError?.message,
        src: audio.src,
        readyState: audio.readyState,
        networkState: audio.networkState,
        currentTime: audio.currentTime,
        duration: audio.duration,
        paused: audio.paused,
        ended: audio.ended,
        error: mediaError
      });
      setIsPlaying(false);
      setIsLoading(false);
    };

    audio.addEventListener('error', handleError);
    return () => audio.removeEventListener('error', handleError);
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
    setDuration,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          if (playlist.length > 0) {
            setCurrentSong((prev) => (prev + 1) % playlist.length);
          }
        }}
        onError={() => {
          if (audioRef.current) {
            setError(audioRef.current.error);
            setIsPlaying(false);
            setIsLoading(false);
          }
        }}
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