-- Phase A: Work Item 필드 확장 (due_date, labels, assignee_id)

-- A-1: 마감일
ALTER TABLE work_items ADD COLUMN due_date DATE;

-- A-2: 라벨 (TEXT 배열, 기본값 빈 배열)
ALTER TABLE work_items ADD COLUMN labels TEXT[] DEFAULT '{}';

-- A-3: 담당자 FK (team_members 참조, SET NULL on delete)
ALTER TABLE work_items ADD COLUMN assignee_id UUID REFERENCES team_members(id) ON DELETE SET NULL;
