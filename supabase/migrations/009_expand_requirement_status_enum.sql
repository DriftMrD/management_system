-- 第一步：扩展进展状态枚举（须单独执行并提交后再跑 010）
-- PostgreSQL 不允许在同一事务中新增枚举值后立即使用

ALTER TYPE requirement_status ADD VALUE IF NOT EXISTS 'reviewed';
ALTER TYPE requirement_status ADD VALUE IF NOT EXISTS 'in_development';
