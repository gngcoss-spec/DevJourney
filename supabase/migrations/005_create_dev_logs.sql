-- @TASK P4-R1-T1 - Create dev logs table with RLS policies
-- @SPEC docs/planning/TASKS.md#dev-logs-table

-- Create dev_logs table
CREATE TABLE IF NOT EXISTS dev_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  done TEXT,
  decided TEXT,
  deferred TEXT,
  next_action TEXT,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create UNIQUE constraint: one log per service per date
CREATE UNIQUE INDEX idx_dev_logs_service_date ON dev_logs(service_id, log_date);

-- Performance indexes
CREATE INDEX idx_dev_logs_service_id ON dev_logs(service_id);
CREATE INDEX idx_dev_logs_user_id ON dev_logs(user_id);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dev_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at auto-update
CREATE TRIGGER trigger_dev_logs_updated_at
BEFORE UPDATE ON dev_logs
FOR EACH ROW
EXECUTE FUNCTION update_dev_logs_updated_at();

-- Create trigger function to update service's last_activity_at
CREATE OR REPLACE FUNCTION update_service_last_activity_from_logs()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE services
  SET last_activity_at = NOW()
  WHERE id = NEW.service_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update service last_activity_at on dev_log changes
CREATE TRIGGER trigger_dev_log_update_service_activity
AFTER INSERT OR UPDATE OR DELETE ON dev_logs
FOR EACH ROW
EXECUTE FUNCTION update_service_last_activity_from_logs();

-- Enable RLS (Row Level Security)
ALTER TABLE dev_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only SELECT their own dev logs
CREATE POLICY "Users can select own dev logs"
  ON dev_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only INSERT their own dev logs
CREATE POLICY "Users can insert own dev logs"
  ON dev_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only UPDATE their own dev logs
CREATE POLICY "Users can update own dev logs"
  ON dev_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only DELETE their own dev logs
CREATE POLICY "Users can delete own dev logs"
  ON dev_logs
  FOR DELETE
  USING (auth.uid() = user_id);
