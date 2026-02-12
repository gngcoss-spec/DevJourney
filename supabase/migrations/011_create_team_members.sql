-- Migration 011: Create team_members table
-- Team members track project collaborators and their roles

CREATE TYPE team_role AS ENUM ('owner', 'contributor', 'viewer');
CREATE TYPE member_status AS ENUM ('active', 'invited', 'inactive');

CREATE TABLE team_members (
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

-- Index for user_id lookups
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- RLS
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

-- updated_at trigger
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
