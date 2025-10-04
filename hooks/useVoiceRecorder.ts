/**
 * useVoiceRecorder - React hook for voice recording
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioRecorder } from '@/lib/ai/voice/audio-recorder';
import { RecordingStatus } from '@/lib/ai/voice/types';

export function useVoiceRecorder() {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Initialize recorder
  useEffect(() => {
    recorderRef.current = new AudioRecorder();

    return () => {
      if (recorderRef.current) {
        recorderRef.current.cancelRecording();
      }
    };
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    setError(null);
    setStatus('requesting');

    try {
      const recorder = recorderRef.current;
      if (!recorder) throw new Error('Recorder not initialized');

      // Request permission
      await recorder.requestPermission();

      // Start recording with waveform callback
      await recorder.startRecording((amplitude) => {
        setWaveformData(prev => [...prev.slice(-50), amplitude]); // Keep last 50 samples
      });

      setStatus('recording');
      startTimeRef.current = Date.now();

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration((Date.now() - startTimeRef.current) / 1000);
      }, 100);

    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (status !== 'recording') return null;

    try {
      const recorder = recorderRef.current;
      if (!recorder) throw new Error('Recorder not initialized');

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const audioBlob = await recorder.stopRecording();
      setStatus('idle');

      return audioBlob;

    } catch (err: any) {
      setError(err.message);
      setStatus('error');
      return null;
    }
  }, [status]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.cancelRecording();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setStatus('idle');
    setDuration(0);
    setWaveformData([]);
    setError(null);
  }, []);

  return {
    status,
    duration,
    waveformData,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording: status === 'recording',
  };
}
