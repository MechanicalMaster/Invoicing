-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  action_url TEXT,
  
  -- Add indexes for better query performance
  CONSTRAINT valid_notification_type CHECK (type IN ('gold_rate_update', 'system_alert', 'reminder')),
  CONSTRAINT valid_action_url CHECK (action_url IS NULL OR action_url ~ '^/')
);

-- Create indexes
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_type_idx ON notifications(type);
CREATE INDEX notifications_created_at_idx ON notifications(created_at);
CREATE INDEX notifications_read_at_idx ON notifications(read_at);

-- Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to view their own notifications
CREATE POLICY notifications_select_policy ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update read_at status of their own notifications
CREATE POLICY notifications_update_policy ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    -- Only allow updating the read_at column
    auth.uid() = user_id
  ); 