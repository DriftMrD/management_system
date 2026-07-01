-- 需求来源枚举
CREATE TYPE requirement_source AS ENUM (
  'other_department',
  'site',
  'user',
  'internal_planning'
);

ALTER TABLE requirements
  ADD COLUMN IF NOT EXISTS source requirement_source,
  ADD COLUMN IF NOT EXISTS ai_prd_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS ai_tracking_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS ai_demo_url TEXT DEFAULT '';
