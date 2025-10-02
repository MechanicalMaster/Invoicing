-- Create audit_logs table for tracking all business-critical actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert audit logs (for API routes)
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: No one can update or delete audit logs (immutable)
-- (No UPDATE or DELETE policies means these operations are blocked)

-- Add comment to table
COMMENT ON TABLE audit_logs IS 'Immutable audit trail for business-critical actions';
COMMENT ON COLUMN audit_logs.action IS 'Action type: inventory_create, file_upload, login_success, etc.';
COMMENT ON COLUMN audit_logs.entity IS 'Entity type: inventory, file, user, notification';
COMMENT ON COLUMN audit_logs.entity_id IS 'Related object ID (UUID or filename)';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context as JSON';
COMMENT ON COLUMN audit_logs.success IS 'Whether the action succeeded';
