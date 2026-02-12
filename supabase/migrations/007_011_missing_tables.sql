-- ============================================
-- DevJourney: Migrations 007~011
-- Supabase SQL Editor에서 한번에 실행
-- 누락된 테이블: decisions, stages, documents, servers, team_members
-- ============================================

-- ============================================
-- 공통: 범용 updated_at 트리거 함수 (없으면 생성)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 007: decisions
-- ============================================
CREATE TABLE IF NOT EXISTS decisions (
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

CREATE INDEX IF NOT EXISTS idx_decisions_service_id ON decisions(service_id);
CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON decisions(user_id);

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

CREATE TRIGGER update_decisions_updated_at
  BEFORE UPDATE ON decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_service_activity_on_decision
  AFTER INSERT OR UPDATE ON decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_service_last_activity();

-- ============================================
-- 008: stages (Roadmap)
-- ============================================
CREATE TABLE IF NOT EXISTS stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stage_name service_stage NOT NULL,
  start_date DATE,
  end_date DATE,
  summary TEXT,
  deliverables TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_id, stage_name)
);

CREATE INDEX IF NOT EXISTS idx_stages_service_id ON stages(service_id);

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

CREATE TRIGGER update_stages_updated_at
  BEFORE UPDATE ON stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 009: documents
-- ============================================
DO $$ BEGIN
  CREATE TYPE doc_type AS ENUM ('planning', 'database', 'api', 'prompt', 'erd', 'architecture', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  doc_type doc_type DEFAULT 'other',
  file_url TEXT,
  external_url TEXT,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_service_id ON documents(service_id);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_service_activity_on_document
  AFTER INSERT OR UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_service_last_activity();

-- ============================================
-- 010: servers
-- ============================================
DO $$ BEGIN
  CREATE TYPE server_status AS ENUM ('active', 'maintenance', 'offline');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS servers (
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

CREATE INDEX IF NOT EXISTS idx_servers_user_id ON servers(user_id);

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

CREATE TRIGGER update_servers_updated_at
  BEFORE UPDATE ON servers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 011: team_members
-- ============================================
DO $$ BEGIN
  CREATE TYPE team_role AS ENUM ('owner', 'contributor', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE member_status AS ENUM ('active', 'invited', 'inactive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  invited_by UUID REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  email TEXT,
  role team_role DEFAULT 'viewer',
  status member_status DEFAULT 'invited',
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own team members"
  ON team_members FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = invited_by);

CREATE POLICY "Users can insert team members"
  ON team_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own team members"
  ON team_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own team members"
  ON team_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
