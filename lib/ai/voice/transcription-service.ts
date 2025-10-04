/**
 * Transcription Service - OpenAI Whisper integration
 */

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
