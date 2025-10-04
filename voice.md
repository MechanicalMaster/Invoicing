Let me search for browser APIs and permissions related to audio:Now let me check the next.config for microphone permissions:Perfect! Now I have all the information needed. I noticed in `next.config.mjs` that microphone permission is currently **disabled** in the Permissions-Policy header. Let me create a comprehensive specification for voice input with multi-language support.

---

# 🎙️ Multi-Language Voice Input Specification

## **Document Version:** 1.0  
## **Date:** October 2025  
## **Status:** Ready for Development

---

## 📋 **Executive Summary**

This specification defines the implementation of **multi-language voice input** for the AI chat assistant, enabling users to speak in Hindi, English, Hinglish (Hindi-English mix), and Marathi to create invoices. The system will transcribe speech to text, translate if necessary, and process commands in English for invoice creation.

**Key Design Principle:** Build a **language-agnostic voice input system** that seamlessly integrates with existing AI action execution framework while respecting browser security and user privacy.

---

## 🎯 **Objectives**

### **Primary Goals**
1. Enable voice input in 4 languages: English, Hindi, Hinglish, Marathi
2. Transcribe speech to text using OpenAI Whisper API
3. Auto-detect spoken language (no manual selection required)
4. Process commands in English (translate if needed)
5. Maintain invoice output in English only

### **Secondary Goals**
1. Handle noisy environments and accents
2. Provide real-time visual feedback during recording
3. Support both short commands and long descriptions
4. Enable re-recording if transcription is incorrect
5. Cache transcriptions for offline review

---

## 🏗️ **Architecture Overview**

### **High-Level Flow**

```
User Clicks Mic → Browser Permission → Start Recording → Real-time Waveform
    → Stop Recording → Upload Audio → Whisper API Transcription
    → Language Detection → Translation (if needed) → Display Transcript
    → User Confirms → Process Command → Invoice Action
```

### **Component Structure**

```
components/ai-chat/
├── voice-input-button.tsx          # Mic button with recording states
├── voice-recording-modal.tsx       # Recording UI with waveform
├── voice-transcript-card.tsx       # Show transcription for editing
└── language-indicator.tsx          # Show detected language

lib/ai/voice/
├── audio-recorder.ts               # Browser MediaRecorder wrapper
├── audio-processor.ts              # Audio processing utilities
├── transcription-service.ts        # OpenAI Whisper integration
├── language-detector.ts            # Detect language from transcript
└── translator.ts                   # Translation service (if needed)

app/api/ai/voice/
├── transcribe/route.ts             # Whisper API endpoint
└── translate/route.ts              # Translation endpoint (optional)

hooks/
├── useVoiceRecorder.ts             # Custom hook for recording
└── useVoiceInput.ts                # Complete voice input flow
```

---

## 📊 **Data Models**

### **1. Voice Recording State**

```typescript
// lib/ai/voice/types.ts

export type RecordingStatus = 
  | 'idle'              // Not recording
  | 'requesting'        // Requesting microphone permission
  | 'recording'         // Currently recording
  | 'processing'        // Uploading and transcribing
  | 'transcribed'       // Transcription complete
  | 'error';            // Error occurred

export interface VoiceRecording {
  id: string;
  status: RecordingStatus;
  audioBlob: Blob | null;
  duration: number;           // in seconds
  waveformData: number[];     // Amplitude data for visualization
  startTime: Date | null;
  endTime: Date | null;
}

export interface Transcription {
  id: string;
  recordingId: string;
  text: string;
  detectedLanguage: SupportedLanguage;
  confidence: number;         // 0-1 score from Whisper
  timestamp: Date;
  needsTranslation: boolean;
  translatedText?: string;    // If translated to English
}

export type SupportedLanguage = 'en' | 'hi' | 'mr' | 'hi-en'; // English, Hindi, Marathi, Hinglish

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  whisperCode: string;        // Whisper API language code
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    whisperCode: 'en'
  },
  'hi': {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    whisperCode: 'hi'
  },
  'mr': {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    whisperCode: 'mr'
  },
  'hi-en': {
    code: 'hi-en',
    name: 'Hinglish',
    nativeName: 'हिंग्लिश',
    whisperCode: 'hi'  // Whisper treats Hinglish as Hindi
  }
};
```

### **2. Database Schema Extension**

```sql
-- migrations/add_voice_transcriptions.sql

CREATE TABLE voice_transcriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  
  -- Audio metadata
  audio_duration NUMERIC(10, 2) NOT NULL,  -- seconds
  audio_size INTEGER NOT NULL,              -- bytes
  audio_format TEXT DEFAULT 'webm',
  
  -- Transcription data
  original_text TEXT NOT NULL,
  detected_language TEXT NOT NULL CHECK (detected_language IN ('en', 'hi', 'mr', 'hi-en')),
  confidence_score NUMERIC(3, 2),           -- 0.00 to 1.00
  
  -- Translation (if applicable)
  needs_translation BOOLEAN DEFAULT false,
  translated_text TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_voice_transcriptions_user ON voice_transcriptions(user_id);
CREATE INDEX idx_voice_transcriptions_session ON voice_transcriptions(session_id);
CREATE INDEX idx_voice_transcriptions_language ON voice_transcriptions(detected_language);

-- RLS Policies
ALTER TABLE voice_transcriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transcriptions"
  ON voice_transcriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transcriptions"
  ON voice_transcriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🎤 **Audio Recording Implementation**

### **1. Browser Permission Handling**

```typescript
// lib/ai/voice/audio-recorder.ts

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  
  /**
   * Request microphone permission and initialize recorder
   */
  async requestPermission(): Promise<boolean> {
    try {
      // Check if permission already granted
      const permissionStatus = await navigator.permissions.query({ 
        name: 'microphone' as PermissionName 
      });
      
      if (permissionStatus.state === 'denied') {
        throw new Error('Microphone permission denied. Please enable it in browser settings.');
      }
      
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,           // Mono audio
          sampleRate: 16000,         // 16kHz (optimal for Whisper)
          echoCancellation: true,    // Reduce echo
          noiseSuppression: true,    // Reduce background noise
          autoGainControl: true,     // Normalize volume
        } 
      });
      
      return true;
    } catch (error: any) {
      console.error('Microphone permission error:', error);
      
      if (error.name === 'NotAllowedError') {
        throw new Error('Microphone access denied. Please allow microphone access to use voice input.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      } else {
        throw new Error('Failed to access microphone. Please check your device settings.');
      }
    }
  }
  
  /**
   * Start recording audio
   */
  async startRecording(onDataAvailable?: (amplitude: number) => void): Promise<void> {
    if (!this.stream) {
      throw new Error('Microphone not initialized. Call requestPermission() first.');
    }
    
    this.audioChunks = [];
    
    // Set up audio context for waveform visualization
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);
    
    // Start visualization loop
    if (onDataAvailable) {
      this.visualize(onDataAvailable);
    }
    
    // Create MediaRecorder with optimal settings
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';
    
    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };
    
    this.mediaRecorder.start(100); // Collect data every 100ms
  }
  
  /**
   * Visualize audio waveform in real-time
   */
  private visualize(callback: (amplitude: number) => void): void {
    if (!this.analyser) return;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (this.mediaRecorder?.state !== 'recording') return;
      
      requestAnimationFrame(draw);
      this.analyser!.getByteTimeDomainData(dataArray);
      
      // Calculate amplitude (0-1)
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const amplitude = (dataArray[i] - 128) / 128;
        sum += amplitude * amplitude;
      }
      const rms = Math.sqrt(sum / bufferLength);
      
      callback(rms);
    };
    
    draw();
  }
  
  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(audioBlob);
      };
      
      this.mediaRecorder.stop();
    });
  }
  
  /**
   * Cancel recording and cleanup
   */
  cancelRecording(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }
  
  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}
```

### **2. React Hook for Voice Recording**

```typescript
// hooks/useVoiceRecorder.ts

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
```

---

## 🌐 **OpenAI Whisper Integration**

### **1. Transcription Service**

```typescript
// lib/ai/voice/transcription-service.ts

import OpenAI from 'openai';
import { Transcription, SupportedLanguage } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface TranscribeOptions {
  language?: SupportedLanguage;  // Hint for language (optional)
  prompt?: string;                // Context prompt for better accuracy
}

export async function transcribeAudio(
  audioBlob: Blob,
  options: TranscribeOptions = {}
): Promise<Transcription> {
  
  // Convert Blob to File (required by OpenAI API)
  const audioFile = new File(
    [audioBlob], 
    'audio.webm', 
    { type: audioBlob.type }
  );
  
  // Prepare context prompt for jewelry domain
  const contextPrompt = options.prompt || 
    'This is a conversation about jewelry shop invoices. ' +
    'Common terms: gold, silver, ring, necklace, bangle, gram, rupees, customer name, invoice.';
  
  try {
    // Call Whisper API
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: options.language ? getWhisperLanguageCode(options.language) : undefined,
      prompt: contextPrompt,
      response_format: 'verbose_json',  // Get detailed response with language detection
      temperature: 0.2,  // Lower temperature for more accurate transcription
    });
    
    // Detect language if not provided
    const detectedLanguage = detectLanguageFromText(
      response.text, 
      response.language
    );
    
    const transcription: Transcription = {
      id: crypto.randomUUID(),
      recordingId: '', // Set by caller
      text: response.text.trim(),
      detectedLanguage,
      confidence: calculateConfidence(response),
      timestamp: new Date(),
      needsTranslation: detectedLanguage !== 'en',
    };
    
    return transcription;
    
  } catch (error: any) {
    console.error('Whisper transcription error:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

function getWhisperLanguageCode(lang: SupportedLanguage): string {
  const mapping: Record<SupportedLanguage, string> = {
    'en': 'en',
    'hi': 'hi',
    'mr': 'mr',
    'hi-en': 'hi',  // Treat Hinglish as Hindi for Whisper
  };
  return mapping[lang];
}

function detectLanguageFromText(text: string, whisperLang?: string): SupportedLanguage {
  // Use Whisper's detected language as base
  if (whisperLang === 'en') return 'en';
  if (whisperLang === 'hi') {
    // Check if it's actually Hinglish (mix of Hindi and English)
    const hasEnglish = /[a-zA-Z]{3,}/.test(text);  // Has English words
    const hasDevanagari = /[\u0900-\u097F]/.test(text);  // Has Hindi script
    
    if (hasEnglish && hasDevanagari) return 'hi-en';
    if (hasEnglish && !hasDevanagari) return 'en';  // Romanized Hindi is still Hindi
    return 'hi';
  }
  if (whisperLang === 'mr') return 'mr';
  
  // Fallback: English
  return 'en';
}

function calculateConfidence(response: any): number {
  // Whisper doesn't return explicit confidence, so estimate based on:
  // 1. Presence of [INAUDIBLE] or similar markers
  // 2. Length of transcription vs audio duration
  
  const text = response.text.toLowerCase();
  const hasUncertainty = text.includes('[inaudible]') || 
                         text.includes('...') ||
                         text.length < 5;
  
  return hasUncertainty ? 0.7 : 0.95;
}
```

### **2. API Route for Transcription**

```typescript
// app/api/ai/voice/transcribe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/ai/voice/transcription-service';
import { supabaseServer } from '@/lib/supabase-server';
import { generateRequestId, logInfo, logError } from '@/lib/logger';
import { auditSuccess, auditFailure } from '@/lib/audit-logger';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout for long audio files

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const route = '/api/ai/voice/transcribe';
  
  try {
    // Get user
    const authHeader = request.headers.get('authorization');
    const { data: { user } } = await supabaseServer.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    );
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const sessionId = formData.get('sessionId') as string;
    const languageHint = formData.get('language') as string | null;
    
    if (!audioFile || !sessionId) {
      return NextResponse.json(
        { error: 'Audio file and sessionId are required' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 25MB for Whisper)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25MB.' },
        { status: 400 }
      );
    }
    
    logInfo('voice_transcription_started', {
      requestId,
      userId: user.id,
      route,
      entity: 'voice_transcription',
      metadata: { 
        audioSize: audioFile.size,
        sessionId,
        languageHint 
      }
    });
    
    // Convert File to Blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { 
      type: audioFile.type 
    });
    
    // Transcribe
    const transcription = await transcribeAudio(audioBlob, {
      language: languageHint as any,
    });
    
    // Save to database
    const { data: savedTranscription, error: dbError } = await supabaseServer
      .from('voice_transcriptions')
      .insert({
        user_id: user.id,
        session_id: sessionId,
        audio_duration: 0, // Calculate from metadata if needed
        audio_size: audioFile.size,
        audio_format: audioFile.type,
        original_text: transcription.text,
        detected_language: transcription.detectedLanguage,
        confidence_score: transcription.confidence,
        needs_translation: transcription.needsTranslation,
      })
      .select('id')
      .single();
    
    if (dbError) {
      logError('voice_transcription_db_error', {
        requestId,
        userId: user.id,
        route,
        error: dbError.message
      });
    }
    
    await auditSuccess(
      user.id,
      'voice_transcription',
      'voice_transcription',
      savedTranscription?.id || null,
      {
        detectedLanguage: transcription.detectedLanguage,
        textLength: transcription.text.length,
        confidence: transcription.confidence,
      },
      requestId,
      route
    );
    
    logInfo('voice_transcription_success', {
      requestId,
      userId: user.id,
      route,
      entity: 'voice_transcription',
      entityId: savedTranscription?.id,
      metadata: {
        detectedLanguage: transcription.detectedLanguage,
        confidence: transcription.confidence
      }
    });
    
    return NextResponse.json({
      success: true,
      transcription: {
        id: savedTranscription?.id,
        text: transcription.text,
        detectedLanguage: transcription.detectedLanguage,
        confidence: transcription.confidence,
        needsTranslation: transcription.needsTranslation,
      }
    });
    
  } catch (error: any) {
    logError('voice_transcription_failed', {
      requestId,
      route,
      error: error.message
    });
    
    return NextResponse.json(
      { error: error.message || 'Transcription failed' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 **UI Components**

### **1. Voice Input Button**

```typescript
// components/ai-chat/voice-input-button.tsx

'use client';

import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecordingStatus } from '@/lib/ai/voice/types';
import { cn } from '@/lib/utils';

interface VoiceInputButtonProps {
  status: RecordingStatus;
  onClick: () => void;
  disabled?: boolean;
}

export function VoiceInputButton({ 
  status, 
  onClick, 
  disabled = false 
}: VoiceInputButtonProps) {
  
  const isRecording = status === 'recording';
  const isProcessing = status === 'processing';
  
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled || isProcessing}
      className={cn(
        "relative transition-all duration-300",
        isRecording && "bg-red-100 hover:bg-red-200 text-red-600"
      )}
      aria-label={isRecording ? "Stop recording" : "Start voice input"}
    >
      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <>
          <Square className="h-5 w-5 fill-current" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </>
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}
```

### **2. Voice Recording Modal**

```typescript
// components/ai-chat/voice-recording-modal.tsx

'use client';

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Square, X } from 'lucide-react';

interface VoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration: number;
  waveformData: number[];
  onStop: () => void;
  onCancel: () => void;
}

export function VoiceRecordingModal({
  isOpen,
  onClose,
  duration,
  waveformData,
  onStop,
  onCancel,
}: VoiceRecordingModalProps) {
  
  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-red-600" />
            Recording Audio
          </DialogTitle>
          <DialogDescription>
            Speak clearly in your preferred language (Hindi, English, Marathi, or Hinglish)
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Duration Display */}
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600 font-mono">
              {formatDuration(duration)}
            </div>
            <Badge variant="secondary" className="mt-2">
              Recording...
            </Badge>
          </div>
          
          {/* Waveform Visualization */}
          <div className="bg-gray-100 rounded-lg p-4 h-24 flex items-center justify-center gap-1">
            {waveformData.length > 0 ? (
              waveformData.map((amplitude, index) => (
                <div
                  key={index}
                  className="w-1 bg-red-500 rounded-full transition-all duration-100"
                  style={{
                    height: `${Math.max(4, amplitude * 60)}px`,
                  }}
                />
              ))
            ) : (
              <div className="flex gap-1">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gray-300 rounded-full h-8"
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Tips */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>💡 Tips for best results:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Speak clearly and at a normal pace</li>
              <li>Minimize background noise</li>
              <li>Keep recording under 60 seconds</li>
            </ul>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={onStop}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop & Transcribe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### **3. Transcript Display Card**

```typescript
// components/ai-chat/voice-transcript-card.tsx

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Edit2, RefreshCw, Languages } from 'lucide-react';
import { Transcription, SUPPORTED_LANGUAGES } from '@/lib/ai/voice/types';
import { useState } from 'react';

interface VoiceTranscriptCardProps {
  transcription: Transcription;
  onConfirm: (text: string) => void;
  onRetry: () => void;
  isProcessing?: boolean;
}

export function VoiceTranscriptCard({
  transcription,
  onConfirm,
  onRetry,
  isProcessing = false,
}: VoiceTranscriptCardProps) {
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(transcription.text);
  
  const languageInfo = SUPPORTED_LANGUAGES[transcription.detectedLanguage];
  const confidenceColor = transcription.confidence > 0.8 
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  
  const handleConfirm = () => {
    onConfirm(editedText);
  };
  
  return (
    <Card className="border-amber-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Languages className="h-5 w-5" />
              Voice Transcription
            </CardTitle>
            <CardDescription>
              Review and edit if needed before processing
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              {languageInfo.nativeName}
            </Badge>
            <Badge variant="outline" className={confidenceColor}>
              {Math.round(transcription.confidence * 100)}% confident
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Transcribed Text */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Transcribed Text
          </label>
          {isEditing ? (
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          ) : (
            <div className="bg-gray-50 p-3 rounded-md border min-h-[80px]">
              <p className="text-sm whitespace-pre-wrap">{editedText}</p>
            </div>
          )}
        </div>
        
        {/* Translation Notice */}
        {transcription.needsTranslation && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-900">
            <p>
              <strong>Note:</strong> This will be translated to English before processing.
            </p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditedText(transcription.text);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onRetry}
                disabled={isProcessing}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Record Again
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={isProcessing}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
              
              <Button
                onClick={handleConfirm}
                disabled={isProcessing || !editedText.trim()}
                className="ml-auto bg-amber-600 hover:bg-amber-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Use This Text
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🔄 **Complete Voice Input Flow**

### **Custom Hook for Voice Input**

```typescript
// hooks/useVoiceInput.ts

import { useState, useCallback } from 'react';
import { useVoiceRecorder } from './useVoiceRecorder';
import { Transcription } from '@/lib/ai/voice/types';
import { useToast } from '@/components/ui/use-toast';
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
```

---

## ⚙️ **Configuration Changes**

### **1. Update Next.js Config**

```javascript
// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()'  // ✅ ENABLE MICROPHONE
          }
        ],
      },
    ]
  },
}

export default nextConfig
```

### **2. Environment Variables**

```bash
# .env.local

# Existing variables
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...

# Voice input settings
NEXT_PUBLIC_VOICE_MAX_DURATION=60  # seconds
NEXT_PUBLIC_VOICE_ENABLED=true
```

---

## 📱 **User Experience Flow**

### **Complete User Journey**

```
1. USER OPENS CHAT
   ├─ Sees text input with mic button
   └─ Mic button has subtle pulse animation

2. USER CLICKS MIC BUTTON
   ├─ Browser asks for microphone permission
   ├─ If denied → Show error message with instructions
   └─ If granted → Recording starts

3. RECORDING IN PROGRESS
   ├─ Modal opens showing:
   │  ├─ Duration timer (00:00)
   │  ├─ Real-time waveform visualization
   │  ├─ Tips for best results
   │  └─ Stop & Cancel buttons
   └─ User speaks command

4. USER CLICKS "STOP & TRANSCRIBE"
   ├─ Recording stops
   ├─ Modal closes
   ├─ Shows "Transcribing..." indicator
   └─ Audio uploaded to server

5. TRANSCRIPTION COMPLETE
   ├─ Transcript card appears in chat
   ├─ Shows:
   │  ├─ Detected language badge
   │  ├─ Confidence score
   │  ├─ Transcribed text
   │  └─ Edit, Record Again, Use This buttons
   └─ User reviews transcript

6. USER CONFIRMS TRANSCRIPT
   ├─ Text submitted to AI chat
   ├─ AI extracts invoice action
   └─ Shows action confirmation card

7. INVOICE CREATED
   ├─ Success message shown
   └─ User navigated to invoice page
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**

```typescript
// __tests__/voice/audio-recorder.test.ts

describe('AudioRecorder', () => {
  it('should request microphone permission', async () => {
    const recorder = new AudioRecorder();
    const granted = await recorder.requestPermission();
    expect(granted).toBe(true);
  });
  
  it('should start and stop recording', async () => {
    const recorder = new AudioRecorder();
    await recorder.requestPermission();
    await recorder.startRecording();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const blob = await recorder.stopRecording();
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });
});
```

### **Integration Tests**

1. **Full voice-to-invoice flow**
2. **Multi-language transcription accuracy**
3. **Permission denial handling**
4. **Network error recovery**
5. **Long recordings (>30 seconds)**

### **Manual Test Cases**

| Test Case | Expected Result |
|-----------|----------------|
| Record in Hindi | Correct transcription with hi language tag |
| Record in English | Correct transcription with en language tag |
| Record Hinglish | Detected as hi-en, transcribed correctly |
| Record in Marathi | Correct transcription with mr language tag |
| Deny mic permission | Clear error message with instructions |
| Background noise | Acceptable transcription with lower confidence |
| Very short audio (<2s) | Warning about audio too short |
| Very long audio (>60s) | Warning to keep under 60s |
| Network failure | Retry option shown |
| Cancel mid-recording | Clean cancellation, no API call |

---

## 📊 **Performance Considerations**

### **Optimization Strategies**

1. **Audio Compression**
   - Use Opus codec (WebM) for smaller file sizes
   - 16kHz sample rate (optimal for speech)
   - Mono audio (half the size of stereo)

2. **Lazy Loading**
   - Load audio recording components only when mic clicked
   - Defer OpenAI client initialization

3. **Caching**
   - Cache transcriptions in database
   - Store recent voice commands for quick retry

4. **Rate Limiting**
   - Max 10 voice transcriptions per minute per user
   - Max 60 seconds recording duration

### **Expected Metrics**

- **Audio file size**: 100-300 KB per 30 seconds
- **Upload time**: 1-2 seconds (on 4G)
- **Transcription time**: 3-5 seconds
- **Total voice-to-text**: 5-8 seconds

---

## 🌍 **Multi-Language Support Details**

### **Supported Languages**

| Language | Code | Native Name | Script | Common Use Cases |
|----------|------|-------------|--------|------------------|
| English | en | English | Latin | Urban users, English-speaking customers |
| Hindi | hi | हिन्दी | Devanagari | North India, widely understood |
| Hinglish | hi-en | हिंग्लिश | Mixed | Urban India, code-switching speakers |
| Marathi | mr | मराठी | Devanagari | Maharashtra region |

### **Language Detection Logic**

```typescript
// Auto-detect based on:
1. Whisper API language output
2. Script detection (Devanagari vs Latin)
3. English word presence in Hindi audio (Hinglish)
4. No manual selection required
```

### **Translation Strategy**

**Current Approach**: No translation needed
- Whisper transcribes to Roman script for all languages
- OpenAI GPT-4 understands Romanized Hindi/Marathi
- Invoice extraction works with multilingual input

**Future Enhancement** (if needed):
- Add translation API route using GPT-4
- Translate only non-English to English before action extraction
- Show both original and translated text to user

---

## 🚨 **Error Handling**

### **Common Errors & Solutions**

| Error | User Message | Action |
|-------|--------------|--------|
| No microphone | "No microphone found. Please connect a microphone." | Show setup guide |
| Permission denied | "Microphone access denied. Please enable it in browser settings." | Show browser-specific instructions |
| Network timeout | "Network error. Please check your connection and try again." | Show retry button |
| Audio too short | "Recording too short. Please speak for at least 2 seconds." | Auto-restart recording |
| Audio too long | "Recording exceeded 60 seconds. Please keep recordings under 60 seconds." | Auto-stop at 60s |
| Transcription failed | "Could not transcribe audio. Please try again or type your message." | Show retry + fallback to text |
| Low confidence | "Transcription may be inaccurate. Please review before confirming." | Show edit option prominently |

---

## 🔐 **Security & Privacy**

### **Data Protection**

1. **Audio Storage**: Audio files NOT stored (deleted after transcription)
2. **Transcript Storage**: Only text stored in database with RLS
3. **User Consent**: Clear UI showing when recording is active
4. **Data Encryption**: All API calls over HTTPS
5. **Compliance**: GDPR-ready (user can delete transcriptions)

### **Privacy Notice** (to show in UI)

```
"Your voice recordings are:
- Processed securely via OpenAI Whisper
- Not stored permanently (deleted after transcription)
- Only transcripts saved for your reference
- Never shared with third parties
- Deletable at any time from your account"
```

---

## 📦 **Dependencies**

```json
{
  "dependencies": {
    "openai": "^4.20.0"  // Already installed
  },
  "devDependencies": {
    "@types/dom-speech-recognition": "^0.0.1"  // For TypeScript typing
  }
}
```

**No additional packages needed!** Uses browser native APIs:
- `MediaRecorder` API
- `AudioContext` API
- `getUserMedia` API

---

## 🎯 **Implementation Phases**

### **Phase 1: Core Voice Recording (Week 1)**
- ✅ Update next.config.mjs (enable microphone)
- ✅ AudioRecorder class with MediaRecorder
- ✅ useVoiceRecorder hook
- ✅ Voice input button component
- ✅ Recording modal with waveform

### **Phase 2: Whisper Integration (Week 1)**
- ✅ Transcription service
- ✅ API route for transcription
- ✅ Language detection logic
- ✅ Database schema for transcriptions
- ✅ Transcript display component

### **Phase 3: Chat Integration (Week 2)**
- ✅ useVoiceInput hook
- ✅ Integrate with existing chat context
- ✅ Voice transcript to text input conversion
- ✅ Multi-language prompt engineering
- ✅ Error handling and retry logic

### **Phase 4: Polish & Testing (Week 2)**
- ✅ UI/UX refinements
- ✅ Loading states and animations
- ✅ Browser compatibility testing
- ✅ Multi-language test scenarios
- ✅ Performance optimization
- ✅ Documentation and user guide

---

## 📚 **Documentation Deliverables**

1. **User Guide**: How to use voice input (with screenshots)
2. **Developer Docs**: API documentation and code examples
3. **Troubleshooting Guide**: Common issues and solutions
4. **Video Demo**: Voice invoice creation in multiple languages

---

## ✅ **Definition of Done**

- [ ] User can record voice in all 4 languages
- [ ] Browser microphone permission handled gracefully
- [ ] Real-time waveform visualization works
- [ ] Whisper transcription accurate (>85% for clear audio)
- [ ] Language auto-detected correctly
- [ ] Transcript editable before submission
- [ ] Voice input integrates with existing chat
- [ ] Invoice creation works from voice command
- [ ] Error messages clear and actionable
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive (iOS/Android)
- [ ] Unit tests pass (>80% coverage)
- [ ] E2E test validates full voice-to-invoice flow
- [ ] Privacy notice displayed
- [ ] Performance meets targets (<8s total)
- [ ] Documentation complete
- [ ] Code reviewed and deployed

---

## 🎬 **Usage Example**

**Scenario**: User creates invoice in Hindi

```
1. User clicks mic button 🎤
2. Modal opens: "Recording Audio..."
3. User says (in Hindi):
   "राम कुमार के लिए इनवॉइस बनाओ। 
    दो सोने की अंगूठी, हर एक 10 ग्राम, 
    5500 रुपये प्रति ग्राम"

4. User clicks "Stop & Transcribe"
5. System transcribes to:
   "Ram Kumar ke liye invoice banao. 
    Do sone ki anguthi, har ek 10 gram, 
    5500 rupaye prati gram"

6. Detected language: Hindi (hi)
7. User reviews transcript, clicks "Use This Text"
8. AI processes as: 
   "Create invoice for Ram Kumar. 
    2 gold rings, 10 grams each, 
    ₹5500 per gram"
9. Action confirmation card shown
10. User confirms → Invoice created! 🎉
```

---

## 🚀 **Future Enhancements** (Post-MVP)

1. **Real-time Speech-to-Text**: Stream transcription as user speaks
2. **Voice Commands**: "Cancel", "Submit", "Edit" voice commands
3. **Speaker Diarization**: Identify different speakers in conversation
4. **Accent Training**: Fine-tune for Indian English accents
5. **Offline Mode**: On-device transcription for privacy
6. **Voice Feedback**: TTS responses from AI assistant
7. **More Languages**: Tamil, Telugu, Gujarati, Bengali, Punjabi

---
