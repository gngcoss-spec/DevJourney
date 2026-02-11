-- @TASK P3-R3-T1 - Create work item comments table with RLS policies
-- @SPEC docs/planning/TASKS.md#work-item-comments-table

-- Create ENUM type for comment types
CREATE TYPE comment_type_enum AS ENUM ('comment', 'status_change', 'system');

-- Create work_item_comments table
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

-- Create indexes for better query performance
CREATE INDEX idx_comments_work_item_id ON work_item_comments(work_item_id);

-- Enable RLS (Row Level Security)
ALTER TABLE work_item_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only SELECT comments on work items they own
CREATE POLICY "Users can select comments on own work items"
  ON work_item_comments
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM work_items WHERE id = work_item_comments.work_item_id
    )
  );

-- RLS Policy: Users can only INSERT comments on work items they own
CREATE POLICY "Users can insert comments on own work items"
  ON work_item_comments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IN (
      SELECT user_id FROM work_items WHERE id = work_item_comments.work_item_id
    )
  );
