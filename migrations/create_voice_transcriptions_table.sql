-- Create voice_transcriptions table
-- This table stores voice transcriptions from the AI chat

CREATE TABLE IF NOT EXISTS voice_transcriptions (
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_voice_transcriptions_user ON voice_transcriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_transcriptions_session ON voice_transcriptions(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_transcriptions_language ON voice_transcriptions(detected_language);
CREATE INDEX IF NOT EXISTS idx_voice_transcriptions_created_at ON voice_transcriptions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE voice_transcriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own transcriptions
CREATE POLICY "Users can view own transcriptions"
  ON voice_transcriptions FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create their own transcriptions
CREATE POLICY "Users can create own transcriptions"
  ON voice_transcriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own transcriptions
CREATE POLICY "Users can update own transcriptions"
  ON voice_transcriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own transcriptions
CREATE POLICY "Users can delete own transcriptions"
  ON voice_transcriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE voice_transcriptions IS 'Stores voice transcriptions from the AI chat feature with multi-language support';
