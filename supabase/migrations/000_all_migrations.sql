-- ============================================
-- DevJourney: All Migrations (001~005)
-- Supabase SQL Editor에서 한번에 실행
-- ============================================

-- ============================================
-- 001: services
-- ============================================
CREATE TYPE service_stage AS ENUM ('idea', 'planning', 'design', 'development', 'testing', 'launch', 'enhancement');
CREATE TYPE service_status AS ENUM ('active', 'stalled', 'paused');

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

CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_status ON services(status);

CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_services_updated_at();

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own services"
  ON services FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own services"
  ON services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own services"
  ON services FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own services"
  ON services FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 002: work_items
-- ============================================
CREATE TYPE work_item_type AS ENUM ('feature', 'bug', 'refactor', 'infra', 'ai-prompt');
CREATE TYPE work_item_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE work_item_status AS ENUM ('backlog', 'ready', 'in-progress', 'review', 'done');

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

CREATE INDEX idx_work_items_service_id ON work_items(service_id);
CREATE INDEX idx_work_items_status ON work_items(status);
CREATE INDEX idx_work_items_service_status ON work_items(service_id, status);

CREATE OR REPLACE FUNCTION update_work_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_work_items_updated_at
BEFORE UPDATE ON work_items
FOR EACH ROW
EXECUTE FUNCTION update_work_items_updated_at();

CREATE OR REPLACE FUNCTION update_service_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE services
  SET last_activity_at = NOW()
  WHERE id = NEW.service_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_work_item_update_service_activity
AFTER INSERT OR UPDATE OR DELETE ON work_items
FOR EACH ROW
EXECUTE FUNCTION update_service_last_activity();

ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own work items"
  ON work_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own work items"
  ON work_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own work items"
  ON work_items FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own work items"
  ON work_items FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 003: ai_sessions
-- ============================================
CREATE TYPE ai_provider_type AS ENUM ('chatgpt', 'gemini', 'claude', 'other');

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

CREATE INDEX idx_ai_sessions_work_item_id ON ai_sessions(work_item_id);
CREATE INDEX idx_ai_sessions_user_id ON ai_sessions(user_id);

ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own ai_sessions"
  ON ai_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai_sessions"
  ON ai_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai_sessions"
  ON ai_sessions FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 004: work_item_comments
-- ============================================
CREATE TYPE comment_type_enum AS ENUM ('comment', 'status_change', 'system');

CREATE TABLE IF NOT EXISTS work_item_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id UUID NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'User',
  content TEXT NOT NULL,
  comment_type comment_type_enum NOT NULL DEFAULT 'comment',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_work_item_id ON work_item_comments(work_item_id);

ALTER TABLE work_item_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select comments on own work items"
  ON work_item_comments FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM work_items WHERE id = work_item_comments.work_item_id));
CREATE POLICY "Users can insert comments on own work items"
  ON work_item_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IN (SELECT user_id FROM work_items WHERE id = work_item_comments.work_item_id));

-- ============================================
-- 005: dev_logs
-- ============================================
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

CREATE UNIQUE INDEX idx_dev_logs_service_date ON dev_logs(service_id, log_date);
CREATE INDEX idx_dev_logs_service_id ON dev_logs(service_id);
CREATE INDEX idx_dev_logs_user_id ON dev_logs(user_id);

CREATE OR REPLACE FUNCTION update_dev_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_dev_logs_updated_at
BEFORE UPDATE ON dev_logs
FOR EACH ROW
EXECUTE FUNCTION update_dev_logs_updated_at();

CREATE OR REPLACE FUNCTION update_service_last_activity_from_logs()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE services
  SET last_activity_at = NOW()
  WHERE id = NEW.service_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_dev_log_update_service_activity
AFTER INSERT OR UPDATE OR DELETE ON dev_logs
FOR EACH ROW
EXECUTE FUNCTION update_service_last_activity_from_logs();

ALTER TABLE dev_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own dev logs"
  ON dev_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dev logs"
  ON dev_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dev logs"
  ON dev_logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own dev logs"
  ON dev_logs FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 006: tech_stack TEXT[] → JSONB (카테고리별)
-- ============================================
ALTER TABLE services
  ALTER COLUMN tech_stack DROP DEFAULT;

ALTER TABLE services
  ALTER COLUMN tech_stack TYPE JSONB USING '{}';

ALTER TABLE services
  ALTER COLUMN tech_stack SET DEFAULT '{}';
