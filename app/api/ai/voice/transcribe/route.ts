/**
 * Voice Transcription API Route
 */

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
        entity: 'voice_transcription',
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
      entity: 'voice_transcription',
      error: error.message
    });

    return NextResponse.json(
      { error: error.message || 'Transcription failed' },
      { status: 500 }
    );
  }
}
