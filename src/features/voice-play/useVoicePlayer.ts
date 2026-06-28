import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AudioRecorderPlayer,
  type PlayBackType,
} from 'react-native-audio-recorder-player';

// Module-level registry: when one player starts, others stop
const activeStopFns: Array<() => void> = [];

function addStopFn(fn: () => void) {
  activeStopFns.push(fn);
}

function removeStopFn(fn: () => void) {
  const idx = activeStopFns.indexOf(fn);
  if (idx >= 0) activeStopFns.splice(idx, 1);
}

export type VoicePlayerState = {
  isPlaying: boolean;
  isPaused: boolean;
  currentPositionMs: number;
  durationMs: number;
  play: (uri: string) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
};

export function useVoicePlayer(): VoicePlayerState {
  const player = useRef(new AudioRecorderPlayer()).current;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPositionMs, setCurrentPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const uriRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    try {
      player.removePlayBackListener();
    } catch {
      // ignore
    }
  }, [player]);

  const stopInternal = useCallback(async () => {
    try {
      await player.stopPlayer();
    } catch {
      // already stopped
    }
    cleanup();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPositionMs(0);
    uriRef.current = null;
  }, [player, cleanup]);

  // Register/unregister stop function
  useEffect(() => {
    addStopFn(stopInternal);
    return () => {
      removeStopFn(stopInternal);
      stopInternal();
    };
  }, [stopInternal]);

  const play = useCallback(async (uri: string) => {
    // Stop all other players
    for (let i = 0; i < activeStopFns.length; i++) {
      if (activeStopFns[i] !== stopInternal) activeStopFns[i]();
    }

    // Resume if same file is paused
    if (isPaused && uriRef.current === uri) {
      try {
        await player.resumePlayer();
        setIsPlaying(true);
        setIsPaused(false);
      } catch {
        await stopInternal();
      }
      player.addPlayBackListener((e: PlayBackType) => {
        setDurationMs(e.duration);
        setCurrentPositionMs(e.currentPosition);
        if (e.currentPosition >= e.duration && e.duration > 0) {
          stopInternal();
        }
      });
      return;
    }

    // Stop current if different file or same file but stopped
    if (uriRef.current) {
      await stopInternal();
    }

    try {
      uriRef.current = uri;
      await player.startPlayer(uri);

      setIsPlaying(true);
      setIsPaused(false);

      player.addPlayBackListener((e: PlayBackType) => {
        setDurationMs(e.duration);
        setCurrentPositionMs(e.currentPosition);
        if (e.currentPosition >= e.duration && e.duration > 0) {
          stopInternal();
        }
      });
    } catch {
      await stopInternal();
    }
  }, [isPaused, player, stopInternal]);

  const pause = useCallback(async () => {
    if (!isPlaying) return;
    try {
      await player.pausePlayer();
      setIsPlaying(false);
      setIsPaused(true);
    } catch {
      // ignore
    }
  }, [isPlaying, player]);

  const stop = useCallback(async () => {
    await stopInternal();
  }, [stopInternal]);

  return { isPlaying, isPaused, currentPositionMs, durationMs, play, pause, stop };
}
