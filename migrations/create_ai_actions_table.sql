-- Create AI Actions Table for tracking AI-generated actions
CREATE TABLE IF NOT EXISTS ai_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'intent_detected', 'extracting', 'validating',
    'awaiting_confirmation', 'executing', 'completed', 'failed', 'cancelled'
  )),
  extracted_data JSONB NOT NULL DEFAULT '{}',
  validation_errors JSONB DEFAULT '[]',
  missing_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  entity_id TEXT NULL,              -- ID of created entity (invoice, customer, etc.)
  error_message TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  executed_at TIMESTAMPTZ NULL,

  CONSTRAINT valid_action_type CHECK (action_type IN (
    'create_invoice', 'update_invoice', 'delete_invoice',
    'create_customer', 'update_customer',
    'create_stock', 'update_stock'
  ))
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_ai_actions_user_id ON ai_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_actions_session_id ON ai_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_actions_status ON ai_actions(status);
CREATE INDEX IF NOT EXISTS idx_ai_actions_created_at ON ai_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_actions_action_type ON ai_actions(action_type);

-- Enable Row Level Security
ALTER TABLE ai_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own AI actions"
  ON ai_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI actions"
  ON ai_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI actions"
  ON ai_actions FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_actions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_ai_actions_timestamp
  BEFORE UPDATE ON ai_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_actions_updated_at();
