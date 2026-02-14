-- Phase B: Work Item 고급 기능
-- B-1: Story Points (추정 포인트)
ALTER TABLE work_items ADD COLUMN story_points INTEGER;

-- B-2: Sub-task 계층 (자기참조 FK)
ALTER TABLE work_items ADD COLUMN parent_id UUID REFERENCES work_items(id) ON DELETE SET NULL;

-- B-3: Work Item 링킹 테이블
CREATE TYPE link_type AS ENUM ('blocks', 'relates_to', 'duplicates');

CREATE TABLE work_item_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  link_type link_type NOT NULL DEFAULT 'relates_to',
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_id, target_id, link_type),
  CHECK (source_id <> target_id)
);

CREATE INDEX idx_work_item_links_source ON work_item_links(source_id);
CREATE INDEX idx_work_item_links_target ON work_item_links(target_id);

ALTER TABLE work_item_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_links" ON work_item_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_links" ON work_item_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_links" ON work_item_links FOR DELETE USING (auth.uid() = user_id);

-- B-4: 댓글 수정/삭제 지원
ALTER TABLE work_item_comments ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE work_item_comments ADD COLUMN is_edited BOOLEAN DEFAULT false;

CREATE POLICY "users_update_own_comments" ON work_item_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users_delete_own_comments" ON work_item_comments FOR DELETE USING (auth.uid() = user_id);
