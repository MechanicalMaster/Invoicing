/**
 * useVoiceInput - Complete voice input flow hook
 */

import { useState, useCallback } from 'react';
import { useVoiceRecorder } from './useVoiceRecorder';
import { Transcription } from '@/lib/ai/voice/types';
import { useToast } from './use-toast';
import supabase from '@/lib/supabase';

export function useVoiceInput(sessionId: string) {
  const { toast } = useToast();
  const recorder = useVoiceRecorder();

  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);

  // Start voice input
  const startVoiceInput = useCallback(async () => {
    try {
      await recorder.startRecording();
      setShowRecordingModal(true);
    } catch (error: any) {
      toast({
        title: 'Microphone Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [recorder, toast]);

  // Stop and transcribe
  const stopAndTranscribe = useCallback(async () => {
    setIsTranscribing(true);

    try {
      // Stop recording and get audio blob
      const audioBlob = await recorder.stopRecording();
      if (!audioBlob) throw new Error('Failed to capture audio');

      setShowRecordingModal(false);

      // Upload to API for transcription
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('sessionId', sessionId);

      const response = await fetch('/api/ai/voice/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transcription failed');
      }

      const result = await response.json();
      setTranscription(result.transcription);

      toast({
        title: 'Transcription Complete',
        description: `Detected language: ${result.transcription.detectedLanguage}`,
      });

    } catch (error: any) {
      toast({
        title: 'Transcription Error',
        description: error.message,
        variant: 'destructive',
      });
      recorder.cancelRecording();
    } finally {
      setIsTranscribing(false);
    }
  }, [recorder, sessionId, toast]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    recorder.cancelRecording();
    setShowRecordingModal(false);
  }, [recorder]);

  // Reset for new recording
  const resetTranscription = useCallback(() => {
    setTranscription(null);
  }, []);

  return {
    // Recording state
    isRecording: recorder.isRecording,
    recordingDuration: recorder.duration,
    waveformData: recorder.waveformData,
    showRecordingModal,

    // Transcription state
    transcription,
    isTranscribing,

    // Actions
    startVoiceInput,
    stopAndTranscribe,
    cancelRecording,
    resetTranscription,

    // Error
    error: recorder.error,
  };
}
