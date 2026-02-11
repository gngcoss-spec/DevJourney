-- @TASK P3-R2-T1 - Create AI sessions table with RLS policies
-- @SPEC docs/planning/TASKS.md#ai-sessions-table

-- Create ENUM type for AI providers
CREATE TYPE ai_provider_type AS ENUM ('chatgpt', 'gemini', 'claude', 'other');

-- Create ai_sessions table
CREATE TABLE IF NOT EXISTS ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id UUID NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider ai_provider_type NOT NULL DEFAULT 'chatgpt',
  session_url TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  key_decisions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_ai_sessions_work_item_id ON ai_sessions(work_item_id);
CREATE INDEX idx_ai_sessions_user_id ON ai_sessions(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only SELECT their own AI sessions
CREATE POLICY "Users can select own ai_sessions"
  ON ai_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only INSERT their own AI sessions
CREATE POLICY "Users can insert own ai_sessions"
  ON ai_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only DELETE their own AI sessions
CREATE POLICY "Users can delete own ai_sessions"
  ON ai_sessions
  FOR DELETE
  USING (auth.uid() = user_id);
