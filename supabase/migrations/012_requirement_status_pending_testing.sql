-- 扩展进展状态：已评审后增加「待排期」，开发中后增加「测试中」

ALTER TYPE requirement_status ADD VALUE IF NOT EXISTS 'pending_schedule';
ALTER TYPE requirement_status ADD VALUE IF NOT EXISTS 'testing';
