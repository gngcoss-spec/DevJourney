-- @TASK P3-R1-T1 - Create work items table with RLS policies
-- @SPEC docs/planning/TASKS.md#work-items-table

-- Create ENUM types for work items
CREATE TYPE work_item_type AS ENUM ('feature', 'bug', 'refactor', 'infra', 'ai-prompt');
CREATE TYPE work_item_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE work_item_status AS ENUM ('backlog', 'ready', 'in-progress', 'review', 'done');

-- Create work_items table
CREATE TABLE IF NOT EXISTS work_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type work_item_type NOT NULL DEFAULT 'feature',
  priority work_item_priority NOT NULL DEFAULT 'medium',
  status work_item_status NOT NULL DEFAULT 'backlog',
  problem TEXT,
  options_considered TEXT,
  decision_reason TEXT,
  result TEXT,
  assignee_name TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_work_items_service_id ON work_items(service_id);
CREATE INDEX idx_work_items_status ON work_items(status);
CREATE INDEX idx_work_items_service_status ON work_items(service_id, status);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_work_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at auto-update
CREATE TRIGGER trigger_work_items_updated_at
BEFORE UPDATE ON work_items
FOR EACH ROW
EXECUTE FUNCTION update_work_items_updated_at();

-- Create trigger function to update service's last_activity_at
CREATE OR REPLACE FUNCTION update_service_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE services
  SET last_activity_at = NOW()
  WHERE id = NEW.service_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update service last_activity_at on work_item changes
CREATE TRIGGER trigger_work_item_update_service_activity
AFTER INSERT OR UPDATE OR DELETE ON work_items
FOR EACH ROW
EXECUTE FUNCTION update_service_last_activity();

-- Enable RLS (Row Level Security)
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only SELECT their own work items
CREATE POLICY "Users can select own work items"
  ON work_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only INSERT their own work items
CREATE POLICY "Users can insert own work items"
  ON work_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only UPDATE their own work items
CREATE POLICY "Users can update own work items"
  ON work_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only DELETE their own work items
CREATE POLICY "Users can delete own work items"
  ON work_items
  FOR DELETE
  USING (auth.uid() = user_id);
