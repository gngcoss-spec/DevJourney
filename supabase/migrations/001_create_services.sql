-- @TASK P2-R1-T1 - Create services table with RLS policies
-- @SPEC docs/planning/TASKS.md#services-table

-- Create ENUM types for services
CREATE TYPE service_stage AS ENUM ('idea', 'planning', 'design', 'development', 'testing', 'launch', 'enhancement');
CREATE TYPE service_status AS ENUM ('active', 'stalled', 'paused');

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  target_users TEXT,
  current_stage service_stage NOT NULL DEFAULT 'idea',
  current_server TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  ai_role TEXT,
  status service_status NOT NULL DEFAULT 'active',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  next_action TEXT,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_status ON services(status);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at auto-update
CREATE TRIGGER trigger_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_services_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only SELECT their own services
CREATE POLICY "Users can select own services"
  ON services
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only INSERT their own services
CREATE POLICY "Users can insert own services"
  ON services
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only UPDATE their own services
CREATE POLICY "Users can update own services"
  ON services
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only DELETE their own services
CREATE POLICY "Users can delete own services"
  ON services
  FOR DELETE
  USING (auth.uid() = user_id);
