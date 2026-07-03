-- 新增研发角色（权限与产品经理相同：按所属产品读写需求）
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'developer';
