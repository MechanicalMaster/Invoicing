/**
 * Voice Input Type Definitions
 */

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
