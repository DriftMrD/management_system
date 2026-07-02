-- 需求落地版本（如 TOS 16.1、Sprint 2026-Q2 等）
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS landing_version TEXT;
