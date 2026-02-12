-- ============================================
-- 006: tech_stack TEXT[] → JSONB (카테고리별)
-- ============================================
-- 기존 tech_stack TEXT[] 컬럼을 JSONB로 변경
-- 구조: { "frontend": [], "backend": [], "ai_engine": [],
--          "visualization": [], "security": [], "integration": [], "deployment": [] }

ALTER TABLE services
  ALTER COLUMN tech_stack DROP DEFAULT;

ALTER TABLE services
  ALTER COLUMN tech_stack TYPE JSONB USING '{}';

ALTER TABLE services
  ALTER COLUMN tech_stack SET DEFAULT '{}';
