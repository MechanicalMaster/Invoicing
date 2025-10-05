-- Migration: Add chat mode support to existing AI chat tables
-- This enables dual-personality AI (sales mode for guests, assistant mode for authenticated users)

-- Add mode column to ai_chat_messages table
ALTER TABLE ai_chat_messages
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'assistant' CHECK (mode IN ('sales', 'assistant', 'help'));

-- Add mode column to ai_chat_sessions table
ALTER TABLE ai_chat_sessions
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'assistant' CHECK (mode IN ('sales', 'assistant', 'help'));

-- Create mode_transitions table to track mode switches
CREATE TABLE IF NOT EXISTS chat_mode_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  from_mode TEXT NOT NULL CHECK (from_mode IN ('sales', 'assistant', 'help')),
  to_mode TEXT NOT NULL CHECK (to_mode IN ('sales', 'assistant', 'help')),
  trigger_reason TEXT NOT NULL CHECK (trigger_reason IN ('login', 'logout', 'page_change')),
  preserve_history BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mode_transitions_user ON chat_mode_transitions(user_id);
CREATE INDEX IF NOT EXISTS idx_mode_transitions_session ON chat_mode_transitions(session_id);
CREATE INDEX IF NOT EXISTS idx_mode_transitions_created ON chat_mode_transitions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_mode ON ai_chat_messages(mode);

-- Enable Row Level Security
ALTER TABLE chat_mode_transitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mode_transitions
CREATE POLICY "Users can view own mode transitions"
  ON chat_mode_transitions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create own mode transitions"
  ON chat_mode_transitions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Add comment for documentation
COMMENT ON TABLE chat_mode_transitions IS 'Tracks chat mode transitions for analytics and debugging';
COMMENT ON COLUMN ai_chat_messages.mode IS 'Chat mode when message was sent: sales (guest), assistant (authenticated), or help (documentation)';
COMMENT ON COLUMN ai_chat_sessions.mode IS 'Primary mode of this chat session';
