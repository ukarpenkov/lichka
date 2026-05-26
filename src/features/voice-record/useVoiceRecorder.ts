import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
} from 'react-native-audio-recorder-player';
import { DocumentDirectoryPath } from 'react-native-fs';
import { ensureDir, VOICE_DIR, generateId } from '../../shared/lib';

const MAX_DURATION_MS = 60_000;

export type VoiceRecorderState = {
  isRecording: boolean;
  durationMs: number;
  startRecording: () => Promise<string | null>;
  stopRecording: () => Promise<{ uri: string; durationMs: number } | null>;
  cancelRecording: () => Promise<void>;
};

export function useVoiceRecorder(): VoiceRecorderState {
  const recorder = useRef(AudioRecorderPlayer).current;
  const [isRecording, setIsRecording] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentUriRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopInternal = useCallback(async () => {
    cleanup();
    setIsRecording(false);
    setDurationMs(0);
    try {
      await recorder.stopRecorder();
      recorder.removeRecordBackListener();
    } catch {
      // already stopped
    }
  }, [recorder, cleanup]);

  // Stop recording when app goes to background
  useEffect(() => {
    const handler = (state: AppStateStatus) => {
      if (state !== 'active' && isRecording) {
        stopInternal();
        currentUriRef.current = null;
      }
    };
    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, [isRecording, stopInternal]);

  const startRecording = useCallback(async (): Promise<string | null> => {
    if (isRecording) return null;

    await ensureDir(VOICE_DIR);
    const id = generateId();
    const path = `${VOICE_DIR}/${id}.m4a`;

    try {
      const uri = await recorder.startRecorder(path, {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.medium,
        AVNumberOfChannelsKeyIOS: 1,
        AVSampleRateKeyIOS: 16000,
      });

      currentUriRef.current = uri;
      setIsRecording(true);
      setDurationMs(0);

      recorder.addRecordBackListener(() => {});

      timerRef.current = setInterval(() => {
        setDurationMs((prev) => {
          const next = prev + 200;
          if (next >= MAX_DURATION_MS) {
            stopInternal();
            return MAX_DURATION_MS;
          }
          return next;
        });
      }, 200);

      return uri;
    } catch {
      return null;
    }
  }, [isRecording, recorder, stopInternal]);

  const stopRecording = useCallback(async (): Promise<{
    uri: string;
    durationMs: number;
  } | null> => {
    if (!isRecording || !currentUriRef.current) return null;

    const uri = currentUriRef.current;
    const finalDuration = durationMs;
    await stopInternal();
    currentUriRef.current = null;

    return { uri, durationMs: finalDuration };
  }, [isRecording, durationMs, stopInternal]);

  const cancelRecording = useCallback(async () => {
    if (!isRecording) return;
    await stopInternal();
    if (currentUriRef.current) {
      try {
        const RNFS = require('react-native-fs');
        const exists = await RNFS.exists(currentUriRef.current);
        if (exists) await RNFS.unlink(currentUriRef.current);
      } catch {
        // ignore
      }
      currentUriRef.current = null;
    }
  }, [isRecording, stopInternal]);

  return { isRecording, durationMs, startRecording, stopRecording, cancelRecording };
}
