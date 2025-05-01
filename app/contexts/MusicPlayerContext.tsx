'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

interface Song {
  title: string;
  artist: string;
  src: string;
  coverUrl?: string;
  album?: string;
}

interface MusicPlayerContextType {
  playlist: Song[];
  currentSongIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: MediaError | null;
  audioRef: React.RefObject<HTMLAudioElement | null>; // Expose ref if needed by consumers, though unlikely now
  currentTrack: Song | undefined;
  hasUserInteracted: boolean;
  // Control Functions
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  // Internal setters might not need exposure
  // setPlaylist: (songs: Song[]) => void;
  // setCurrentSongIndex: (indexOrUpdater: number | ((prev: number) => number)) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  // --- State Management ---
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<MediaError | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isTimeApplied, setIsTimeApplied] = useState(false);

  // --- Refs ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wasPlayingRef = useRef(false);
  const isSeekingRef = useRef(false);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Derived State ---
  const currentTrack = playlist[currentSongIndex];

  // --- Effects --- (Copied & Adapted from previous CustomMusicPlayer implementation)

  // 1. Load Initial State & Add Interaction Listener
   useEffect(() => {
    console.log('[Context Init] Restoring state & adding listeners');
    // Restore state from localStorage
    const savedIndex = localStorage.getItem('musicPlayer_currentSong');
    const savedVolume = localStorage.getItem('musicPlayer_volume');
    const savedIsMuted = localStorage.getItem('musicPlayer_isMuted');
    const savedTime = localStorage.getItem('musicPlayer_currentTime');
    // We don't restore isPlaying directly to respect autoplay policies
    // wasPlayingRef will handle resuming after interaction/visibility change

    if (savedIndex) setCurrentSongIndex(parseInt(savedIndex, 10));
    if (savedVolume) setVolume(parseFloat(savedVolume));
    if (savedIsMuted) setIsMuted(savedIsMuted === 'true');
    if (savedTime) setCurrentTime(parseFloat(savedTime)); // Will be applied on loadedmetadata

    // Interaction Listener
    const handleInteraction = () => {
      if (!hasUserInteracted) {
        console.log('[Context Interaction] User interaction detected');
        setHasUserInteracted(true);
        // Optional: Immediately try to play if it was intended before interaction
        if (wasPlayingRef.current && audioRef.current?.paused) {
            console.log('[Context Interaction] Attempting to play after first interaction.');
            audioRef.current.play().catch(e => {
                console.error('Error playing on interaction:', e);
                // Don't set isPlaying false here, let the play effect handle it
            });
        }
        // Clean up listeners after first interaction
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      }
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once

  // 2. Load Playlist
  useEffect(() => {
    async function loadMusic() {
        console.log('[Context Playlist] Fetching music list');
        setIsLoading(true);
        try {
            const response = await fetch('/api/music');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.files && Array.isArray(data.files)) {
                setPlaylist(data.files);
                console.log('[Context Playlist] Playlist loaded:', data.files);
                 // Restore isPlaying state AFTER playlist is loaded and user potentially interacted
                const savedIsPlaying = localStorage.getItem('musicPlayer_isPlaying') === 'true';
                wasPlayingRef.current = savedIsPlaying; // Store initial intent

            } else {
                setPlaylist([]);
            }
        } catch (err) {
            console.error('Error loading music:', err);
            setError(new Error('Failed to load playlist') as any); // Cast for simplicity
            setPlaylist([]);
        } finally {
             // Loading state is primarily controlled by audio events now
        }
    }
    loadMusic();
  }, []);

  // 3. Setup Audio Source & Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) {
        if (playlist.length > 0 && !currentTrack) {
             console.warn(`[Context Audio Setup] Invalid index ${currentSongIndex}, resetting.`);
             setCurrentSongIndex(0);
        }
        return;
    }

    console.log(`[Context Audio Setup] Setting up for: ${currentTrack.title}`);
    const wasCurrentlyPlaying = isPlaying; // Remember if it was playing *before* changing src

    // Stop playback before changing source
    if (!audio.paused) audio.pause();

    setIsLoading(true);
    setIsTimeApplied(false);
    setError(null);
    audio.src = currentTrack.src;
    audio.volume = volume;
    audio.muted = isMuted;

    // --- Audio Event Handlers ---
     const handleLoadedMetadata = () => {
        console.log(`[Context Event loadedmetadata] ${currentTrack.title}`);
        setDuration(audio.duration || 0);
        if (!isTimeApplied && isFinite(currentTime) && currentTime >= 0) {
            if (audio.readyState >= 1) {
                console.log(`[Context Event loadedmetadata] Applying time: ${currentTime}`);
                if (Math.abs(audio.currentTime - currentTime) > 0.1) {
                    audio.currentTime = currentTime;
                }
                setIsTimeApplied(true);
            } else {
                 setIsTimeApplied(true); // Mark attempted even if failed
            }
        } else {
            if (!isTimeApplied) setIsTimeApplied(true); // Ensure flag is set
        }
    };

    const handleCanPlay = () => {
        console.log(`[Context Event canplay] ${currentTrack.title}`);
        setIsLoading(false);
        // If the intended state (or state before src change) was playing, try resuming now
        if ((isPlaying || wasCurrentlyPlaying) && audio.paused && hasUserInteracted) {
            console.log(`[Context Event canplay] Attempting play (isPlaying=${isPlaying}, wasCurrentlyPlaying=${wasCurrentlyPlaying})`);
            audio.play().catch(e => {
                console.error('[Context Event canplay] Error playing:', e);
                if (e instanceof Error && e.name === 'NotAllowedError') setIsPlaying(false);
                else setError(audio.error);
            });
        } else if ((isPlaying || wasCurrentlyPlaying) && !hasUserInteracted) {
             console.log('[Context Event canplay] Ready, but waiting for interaction.');
             // If state is playing but interaction missing, correct it
             if (isPlaying) setIsPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        if (!isSeekingRef.current) { 
            const time = audio.currentTime;
            setCurrentTime(time);
            localStorage.setItem('musicPlayer_currentTime', time.toString());
        }
    };

    const handleEnded = () => {
        console.log(`[Context Event ended] ${currentTrack.title}`);
        playNext();
    };

    const handleAudioError = (e: Event) => {
        console.error('[Context Event error] Audio error:', audio.error);
        setError(audio.error);
        setIsLoading(false);
        setIsPlaying(false);
        setIsTimeApplied(false);
    };

    const handleLoadStart = () => {
        console.log('[Context Event loadstart]');
        setIsLoading(true);
    };

    // Add listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('loadstart', handleLoadStart);

    audio.load();

    // Cleanup
    return () => {
        console.log(`[Context Audio Setup Cleanup] ${currentTrack.title}`);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleAudioError);
        audio.removeEventListener('loadstart', handleLoadStart);
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSongIndex, playlist]); // Rerun only when song or playlist changes

  // 4. Control Play/Pause based on isPlaying State
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
        // Only try to play if conditions are met
        if (isTimeApplied && audio.readyState >= 3 && audio.paused && hasUserInteracted) {
            console.log(`[Context Play/Pause Effect] isPlaying=true, attempting play()`);
            audio.play().catch(e => {
                console.error('[Context Play/Pause Effect] Play error:', e);
                 if (e instanceof Error && e.name === 'NotAllowedError') {
                    setIsPlaying(false); // Correct state
                 } else {
                     setError(audio.error);
                     setIsPlaying(false);
                 }
            });
        } else if (!hasUserInteracted && audio.paused) {
             // If play is toggled true but no interaction, revert state
             if (isPlaying) setIsPlaying(false);
        }
    } else {
        // If state is false, pause
        if (!audio.paused) {
            console.log('[Context Play/Pause Effect] isPlaying=false, pausing');
            audio.pause();
        }
    }
  }, [isPlaying, isTimeApplied, hasUserInteracted]); // React to state changes

  // 5. Handle Volume/Mute
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
        audioRef.current.muted = isMuted;
        localStorage.setItem('musicPlayer_volume', volume.toString());
        localStorage.setItem('musicPlayer_isMuted', isMuted.toString());
    }
  }, [volume, isMuted]);

  // 6. Save Core State (Index, Play Intent)
  useEffect(() => {
    localStorage.setItem('musicPlayer_currentSong', currentSongIndex.toString());
    // Save the *actual* playing state to reflect reality after interaction checks etc.
    localStorage.setItem('musicPlayer_isPlaying', isPlaying.toString());
  }, [currentSongIndex, isPlaying]);

  // 7. Handle Visibility Change
   useEffect(() => {
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
            console.log('[Context Visibility] Page hidden');
            wasPlayingRef.current = isPlaying; // Store the *actual* current state
            // Optional: pause audio when hidden
            // if (isPlaying) audioRef.current?.pause();
        } else if (document.visibilityState === 'visible') {
            console.log('[Context Visibility] Page visible');
            // If it was playing before hiding, try to resume by setting state
            if (wasPlayingRef.current && hasUserInteracted) {
                console.log('[Context Visibility] Resuming playback by setting isPlaying=true');
                setIsPlaying(true); // Let the play/pause effect handle the actual play()
            } else if (wasPlayingRef.current && !hasUserInteracted) {
                console.log('[Context Visibility] Would resume, but awaiting interaction.');
            }
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, hasUserInteracted]);


  // --- Control Functions ---

  const togglePlay = useCallback(() => {
    // First interaction check
    if (!hasUserInteracted) {
        console.log('[Context togglePlay] First interaction via toggle.');
        setHasUserInteracted(true);
        // Check audioRef.current before accessing properties
        const audio = audioRef.current;
        if (audio && audio.readyState >= 3 && audio.paused && wasPlayingRef.current) {
             audio.play().catch(e => console.error('Error playing on first toggle:', e));
             setIsPlaying(true); // Set state directly as we triggered play
             return; // Exit early
        }
    }
     // Otherwise, just toggle the state, the effect will handle it
    setIsPlaying(prev => !prev);
  }, [hasUserInteracted]);

  const playNext = useCallback(() => {
    if (playlist.length > 0) {
      const nextIndex = (currentSongIndex + 1) % playlist.length;
      setCurrentSongIndex(nextIndex);
    }
  }, [playlist, currentSongIndex]);

  const playPrevious = useCallback(() => {
    if (playlist.length > 0) {
      const prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
      setCurrentSongIndex(prevIndex);
    }
  }, [playlist, currentSongIndex]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current || !isFinite(time) || time < 0 || time > duration) return;

    console.log(`[Context Seek] Seeking to ${time}`);
    isSeekingRef.current = true;
    if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);

    // Update audio element time directly
    audioRef.current.currentTime = time;
    // Update state immediately for UI responsiveness
    setCurrentTime(time);
    localStorage.setItem('musicPlayer_currentTime', time.toString());
    setIsTimeApplied(true); // Seeking means time is applied

    seekTimeoutRef.current = setTimeout(() => {
      isSeekingRef.current = false;
      console.log('[Context Seek] Seeking finished');
      // If intended to play, ensure it resumes after seek
      if (isPlaying && audioRef.current?.paused && hasUserInteracted) {
         audioRef.current.play().catch(e => console.error('Error resuming play after seek:', e));
      }
    }, 150);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, isPlaying, hasUserInteracted]); // Add dependencies

  const handleSetVolume = useCallback((newVolume: number) => {
      setVolume(newVolume);
      if (isMuted && newVolume > 0) {
          setIsMuted(false); // Unmute if volume adjusted
      }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
      setIsMuted(prev => !prev);
  }, []);


  // --- Context Value ---
  const value: MusicPlayerContextType = {
    playlist,
    currentSongIndex,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    isLoading,
    error,
    audioRef,
    currentTrack,
    hasUserInteracted,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    setVolume: handleSetVolume,
    toggleMute,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      {/* The actual audio element lives here, controlled by the context */}
      <audio ref={audioRef} preload="metadata" />
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