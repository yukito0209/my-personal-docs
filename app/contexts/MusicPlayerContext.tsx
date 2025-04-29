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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化音乐列表
  useEffect(() => {
    fetch('/api/music')
      .then(res => res.json())
      .then(data => {
        setPlaylist(data.files);
      })
      .catch(error => {
        console.error('Error fetching music files:', error);
      });
  }, []);

  // 监听音量变化
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 监听歌曲变化
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }, [currentSong, isPlaying]);

  const value = {
    playlist,
    currentSong,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
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
        src={playlist[currentSong]?.src}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          if (playlist.length > 0) {
            setCurrentSong((prev) => (prev + 1) % playlist.length);
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