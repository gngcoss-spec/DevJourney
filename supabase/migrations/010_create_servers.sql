-- Migration 010: Create servers table
-- Servers track infrastructure used by services

CREATE TYPE server_status AS ENUM ('active', 'maintenance', 'offline');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');

CREATE TABLE servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  ip TEXT,
  description TEXT,
  purpose TEXT,
  status server_status DEFAULT 'active',
  risk_level risk_level DEFAULT 'low',
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for user_id lookups
CREATE INDEX idx_servers_user_id ON servers(user_id);

-- RLS
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own servers"
  ON servers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own servers"
  ON servers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own servers"
  ON servers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own servers"
  ON servers FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at trigger
CREATE TRIGGER update_servers_updated_at
  BEFORE UPDATE ON servers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
