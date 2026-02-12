-- Migration 007: Create decisions table
-- Decisions track architectural/technical choices made during development

CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  background TEXT,
  options JSONB DEFAULT '[]',
  selected_option TEXT,
  reason TEXT,
  impact TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for service_id lookups
CREATE INDEX idx_decisions_service_id ON decisions(service_id);

-- Index for user_id lookups
CREATE INDEX idx_decisions_user_id ON decisions(user_id);

-- RLS
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own decisions"
  ON decisions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions"
  ON decisions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions"
  ON decisions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decisions"
  ON decisions FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at trigger
CREATE TRIGGER update_decisions_updated_at
  BEFORE UPDATE ON decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- service activity trigger (update last_activity_at on service)
CREATE TRIGGER update_service_activity_on_decision
  AFTER INSERT OR UPDATE ON decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_service_last_activity();
