-- Migration 008: Create stages table (Roadmap)
-- Stages track the progression of a service through development phases

CREATE TABLE stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stage_name service_stage NOT NULL,  -- reuse existing ENUM
  start_date DATE,
  end_date DATE,
  summary TEXT,
  deliverables TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_id, stage_name)
);

-- Index for service_id lookups
CREATE INDEX idx_stages_service_id ON stages(service_id);

-- RLS
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stages"
  ON stages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stages"
  ON stages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stages"
  ON stages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stages"
  ON stages FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at trigger
CREATE TRIGGER update_stages_updated_at
  BEFORE UPDATE ON stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
