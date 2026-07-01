-- 第二步：迁移数据并移除 RAT 字段（在 009 执行成功后运行）

-- 原 RAT 已通过的需求映射为「已评审」
UPDATE requirements
SET status = 'reviewed'
WHERE rat_status = 'passed'
  AND status IN ('not_started', 'in_progress');

DROP INDEX IF EXISTS idx_requirements_rat;

ALTER TABLE requirements DROP COLUMN IF EXISTS rat_status;
ALTER TABLE requirements DROP COLUMN IF EXISTS rat_notes;

DROP TYPE IF EXISTS rat_status;
