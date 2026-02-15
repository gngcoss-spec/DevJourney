-- Migration 014: Code Analyses table for GitHub repo analysis feature
-- Stores analysis results including findings and health scores

CREATE TYPE analysis_status AS ENUM ('pending', 'running', 'completed', 'failed');

CREATE TABLE code_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  repo_url TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  status analysis_status DEFAULT 'pending',
  repo_info JSONB,
  findings JSONB DEFAULT '[]',
  summary JSONB,
  error_message TEXT,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_code_analyses_service_id ON code_analyses(service_id);
CREATE INDEX idx_code_analyses_user_id ON code_analyses(user_id);
CREATE INDEX idx_code_analyses_status ON code_analyses(status);

-- RLS
ALTER TABLE code_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own code analyses"
  ON code_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own code analyses"
  ON code_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own code analyses"
  ON code_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own code analyses"
  ON code_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at trigger
CREATE TRIGGER set_code_analyses_updated_at
  BEFORE UPDATE ON code_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Service activity trigger (reuse existing pattern)
CREATE OR REPLACE FUNCTION update_service_activity_on_code_analysis()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE services SET last_activity_at = now() WHERE id = NEW.service_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_code_analysis_service_activity
  AFTER INSERT OR UPDATE ON code_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_service_activity_on_code_analysis();
