-- 从 CSV 导入需求池数据
-- 在 Supabase Dashboard → SQL Editor 中执行

INSERT INTO products (name, code) VALUES
  ('计算器', 'calculator'),
  ('时钟', 'clock'),
  ('Note', 'note'),
  ('主题', 'theme'),
  ('录音机', 'recorder'),
  ('换机助手', 'phone_transfer'),
  ('天气', 'weather'),
  ('文件管理', 'file_manager'),
  ('玩机技巧', 'phone_tips'),
  ('扫一扫', 'scanner'),
  ('Visha', 'visha')
ON CONFLICT (code) DO NOTHING;

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'日历反馈入口服务端需求',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  E'7/9',
  'not_applicable'::rat_status,
  E'产品经理: 赵煜\n提出日期: 2026/06/05',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/wiki/Luhww1OziiD6dtkIhcrcLPaUnGg"}]'::jsonb
FROM products p
WHERE p.code = 'calendar'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'日历反馈入口服务端需求' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'节庆小组件',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 赵煜\nGlocal小组件需求，已过RAT',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/wiki/MGFMwQtweiPFYYkqDVpcjPJAnrc?from=from_lark_index_search&ccm_open_type=from_lark_index_search"}]'::jsonb
FROM products p
WHERE p.code = 'calendar'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'节庆小组件' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'日程导入',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  E'9月',
  'passed'::rat_status,
  E'产品经理: 赵煜',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/wiki/KoBawZ9pfimiRzkFDBocxaKjnGe"}]'::jsonb
FROM products p
WHERE p.code = 'calendar'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'日程导入' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'台历视图',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'not_reviewed'::rat_status,
  E'产品经理: 赵煜',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/wiki/E9avwHieNiC3dBkyLXAcZQT7n7g"}]'::jsonb
FROM products p
WHERE p.code = 'calendar'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'台历视图' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'重要日需求',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  E'x月',
  'passed'::rat_status,
  E'产品经理: 赵煜',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/wiki/F2kzwfcsRiRnhykMUU0cFjHOnbc"}]'::jsonb
FROM products p
WHERE p.code = 'calendar'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'重要日需求' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'贷款相关需求',
  '',
  p.id,
  'P1'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'not_reviewed'::rat_status,
  E'产品经理: 徐斌\n已报4.23RAT',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/docx/HHMPdxOJVoBHx8xaNTMc9HWEnVh"}]'::jsonb
FROM products p
WHERE p.code = 'calculator'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'贷款相关需求' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'穆斯林时钟相关',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'passed'::rat_status,
  E'产品经理: 徐斌\n已过RAT',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/docx/DWPqdlvofoGvj0xwllJc0s6jngd"}]'::jsonb
FROM products p
WHERE p.code = 'clock'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'穆斯林时钟相关' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'体验优化',
  '',
  p.id,
  'P1'::priority_level,
  'in_progress'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'passed'::rat_status,
  E'产品经理: 徐斌\n已过RAT',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'clock'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'体验优化' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'身份选择页',
  '',
  p.id,
  'P0'::priority_level,
  'scheduled'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 邱纬晨',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'note'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'身份选择页' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'AI 功能首页露出、推荐、引导',
  '',
  p.id,
  'P0'::priority_level,
  'scheduled'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 邱纬晨',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'note'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'AI 功能首页露出、推荐、引导' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'note 文件夹层级',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 邱纬晨',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'note'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'note 文件夹层级' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'图片笔记',
  '',
  p.id,
  'P1'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'not_reviewed'::rat_status,
  E'产品经理: 邱纬晨',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'note'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'图片笔记' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'AI 课堂助手',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 邱纬晨\n高风险，强依赖于AI的接口能力',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'note'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'AI 课堂助手' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'AI课表需求',
  '',
  p.id,
  'P0'::priority_level,
  'scheduled'::requirement_status,
  'agile'::schedule_type,
  E'7月',
  'passed'::rat_status,
  E'产品经理: 赵煜',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/wiki/PsMowbdMjihX6akqhY8ckcTnnjf"}]'::jsonb
FROM products p
WHERE p.code = 'calendar'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'AI课表需求' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'编辑器支持OS16主题打包',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'agile'::schedule_type,
  E'6月',
  'not_reviewed'::rat_status,
  E'产品经理: 赵富田',
  false,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/wiki/L5mSw84j6ixytBk31iocUH2VnZ8"}]'::jsonb
FROM products p
WHERE p.code = 'theme'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'编辑器支持OS16主题打包' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'全场景录音，支持内外录及ASR和多模版摘要',
  '',
  p.id,
  'P0'::priority_level,
  'scheduled'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 金鹏,周熠玮',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/wiki/Dwn6wdVJKiHKLCkpsjNcjejgnzf"}]'::jsonb
FROM products p
WHERE p.code = 'recorder'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'全场景录音，支持内外录及ASR和多模版摘要' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'AI 语音输入',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 邱纬晨',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'note'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'AI 语音输入' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'AI 语音笔记（标记）',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 邱纬晨\n背后有多种方案',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'note'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'AI 语音笔记（标记）' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'粉丝用户备份&恢复',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 邱纬晨\n已上RAT',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'phone_transfer'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'粉丝用户备份&恢复' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'汇率接口调用优化',
  '',
  p.id,
  'P1'::priority_level,
  'completed'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'not_reviewed'::rat_status,
  E'产品经理: 徐斌\n服务端发现接口调用异常，故优化。',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'calculator'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'汇率接口调用优化' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'主题商城创作者1期',
  '',
  p.id,
  'P0'::priority_level,
  'completed'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'passed'::rat_status,
  E'产品经理: 赵富田',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/wiki/YWJHwFjdeiqWYlkeIo9cO58Hncf"}]'::jsonb
FROM products p
WHERE p.code = 'theme'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'主题商城创作者1期' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'主题商城接入paynicorn支付能力',
  '',
  p.id,
  'P0'::priority_level,
  'completed'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'passed'::rat_status,
  E'产品经理: 赵富田',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/docx/QE0ud4LtmohzrnxHJNLcKe8Jnmd"}]'::jsonb
FROM products p
WHERE p.code = 'theme'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'主题商城接入paynicorn支付能力' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'动态壁纸',
  '',
  p.id,
  'P0'::priority_level,
  'completed'::requirement_status,
  'tos'::schedule_type,
  E'3月',
  'not_applicable'::rat_status,
  E'产品经理: 赵富田\ntOS16.3',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/docx/Y9p5dV1LdoH5UPx9LyVcptwDnrf"}]'::jsonb
FROM products p
WHERE p.code = 'theme'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'动态壁纸' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'天气接入自升级SDK',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'not_applicable'::rat_status,
  E'产品经理: 郑爽\n5月初',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'weather'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'天气接入自升级SDK' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'天气接入商业化SDK',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'passed'::rat_status,
  E'产品经理: 郑爽\n5月初',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'weather'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'天气接入商业化SDK' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'Top国家切在线接口及层级优化',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'not_applicable'::rat_status,
  E'产品经理: 郑爽\n专项已拉通',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'weather'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'Top国家切在线接口及层级优化' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'天气早晚报',
  '',
  p.id,
  'P1'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'passed'::rat_status,
  E'产品经理: 郑爽\n需单独进行内审（可和RAT一起）\n方案优化',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'weather'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'天气早晚报' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'异常天气提醒',
  '',
  p.id,
  'P1'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'not_reviewed'::rat_status,
  E'产品经理: 郑爽\n方案优化',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'weather'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'异常天气提醒' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'离线城市库优化',
  '',
  p.id,
  'P1'::priority_level,
  'in_progress'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'not_applicable'::rat_status,
  E'产品经理: 郑爽\n服务端',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'weather'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'离线城市库优化' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'客户端缓存策略优化',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'not_applicable'::rat_status,
  E'产品经理: 郑爽',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'weather'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'客户端缓存策略优化' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'天气韩语翻译（产品线需求）',
  '',
  p.id,
  'P2'::priority_level,
  'completed'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 郑爽\ntOS16.3',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'weather'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'天气韩语翻译（产品线需求）' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'天气1月份遗留需求',
  '',
  p.id,
  'P2'::priority_level,
  'scheduled'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'not_reviewed'::rat_status,
  E'产品经理: 郑爽',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'weather'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'天气1月份遗留需求' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'AI文管-接入知识库',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 金鹏',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'file_manager'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'AI文管-接入知识库' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'铃声相关优化',
  '',
  p.id,
  'P1'::priority_level,
  'in_progress'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'passed'::rat_status,
  E'产品经理: 徐斌\n已过RAT',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'clock'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'铃声相关优化' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'AI 语音翻译',
  '',
  p.id,
  'P0'::priority_level,
  'completed'::requirement_status,
  'agile'::schedule_type,
  E'4月',
  'passed'::rat_status,
  E'产品经理: 邱纬晨',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'note'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'AI 语音翻译' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'基础体验增强（剪辑、倍速、回收站、分类等）',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 金鹏,周熠玮',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'recorder'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'基础体验增强（剪辑、倍速、回收站、分类等）' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'后台优化（功能黑白名单，多语言等）',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  NULL,
  E'2026/04/24',
  'not_reviewed'::rat_status,
  E'产品经理: 石诗曼',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'phone_tips'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'后台优化（功能黑白名单，多语言等）' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'后台新增功能（OS筛选，机型清单等）',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  NULL,
  E'2026/04/24',
  'not_reviewed'::rat_status,
  E'产品经理: 石诗曼',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'phone_tips'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'后台新增功能（OS筛选，机型清单等）' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'铃声&字体',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 赵富田',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'theme'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'铃声&字体' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'录音文件改m4a格式',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'not_applicable'::rat_status,
  E'产品经理: 周熠玮',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'recorder'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'录音文件改m4a格式' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'日历widegt',
  '',
  p.id,
  'P0'::priority_level,
  'completed'::requirement_status,
  'tos'::schedule_type,
  E'5月',
  'passed'::rat_status,
  E'产品经理: 赵煜\n需求拆SR',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/docx/HuK9de9F7omA97xYD5ScfOUInYf"}]'::jsonb
FROM products p
WHERE p.code = 'calendar'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'日历widegt' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'日历课堂笔记',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'tos'::schedule_type,
  E'6月',
  'passed'::rat_status,
  E'产品经理: 赵煜\nNOTE需求拆SR',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/wiki/Vw1jw4vKDiYIbDkoeOVcRmFwnCd"}]'::jsonb
FROM products p
WHERE p.code = 'calendar'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'日历课堂笔记' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'引导用户在新机上跳转玩机；',
  '',
  p.id,
  'P1'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'not_reviewed'::rat_status,
  E'产品经理: 邱纬晨',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'phone_transfer'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'引导用户在新机上跳转玩机；' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'远码/小码识别优化',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'not_reviewed'::rat_status,
  E'产品经理: 徐斌\n已过RAT',
  false,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/docx/KxwCdp7EsoK8t2xdNhWcwIjZnVc"}]'::jsonb
FROM products p
WHERE p.code = 'scanner'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'远码/小码识别优化' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'多码识别优化',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'not_reviewed'::rat_status,
  E'产品经理: 徐斌\n已过RAT',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'scanner'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'多码识别优化' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'My buddy 换机支持',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'not_reviewed'::rat_status,
  E'产品经理: 邱纬晨',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'phone_transfer'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'My buddy 换机支持' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'换机不支持的三方引用引导跳转PS',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'not_reviewed'::rat_status,
  E'产品经理: 邱纬晨',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'phone_transfer'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'换机不支持的三方引用引导跳转PS' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'账号 换机支持',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 邱纬晨\n已上RAT',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'phone_transfer'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'账号 换机支持' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'识别数字账号，跳转到opay/palmpay支付',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 徐斌\n已上RAT',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'scanner'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'识别数字账号，跳转到opay/palmpay支付' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'识别数字账号，跳转到opay/palmpay支付埋点',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 徐斌\n已上RAT',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'scanner'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'识别数字账号，跳转到opay/palmpay支付埋点' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'接入TT短视频内容',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'not_reviewed'::rat_status,
  E'',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'visha'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'接入TT短视频内容' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'Visha 商业化（接入搜索、下载、视频暂停）',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'not_reviewed'::rat_status,
  E'产品经理: 金鹏',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'visha'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'Visha 商业化（接入搜索、下载、视频暂停）' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'小镇业务员-通话摘要存储到记事本',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 邱纬晨',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'note'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'小镇业务员-通话摘要存储到记事本' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'工具Glocal widget',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'passed'::rat_status,
  E'产品经理: 邱纬晨',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'note'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'工具Glocal widget' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'温度算算优化',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'not_reviewed'::rat_status,
  E'产品经理: 徐斌\n已过RAT',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'calculator'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'温度算算优化' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'扫一扫支付合作伙伴页面优化',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'not_reviewed'::rat_status,
  E'产品经理: 徐斌',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'scanner'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'扫一扫支付合作伙伴页面优化' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'斋月信息显示需求',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  NULL,
  'not_reviewed'::rat_status,
  E'产品经理: 徐斌\n视觉调研方案设计ing',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'clock'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'斋月信息显示需求' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'AI随身Pin 录音需求',
  '',
  p.id,
  'P1'::priority_level,
  'not_started'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'not_reviewed'::rat_status,
  E'产品经理: 周熠玮',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'recorder'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'AI随身Pin 录音需求' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'录音耳机能力拉齐',
  '',
  p.id,
  'P1'::priority_level,
  'not_started'::requirement_status,
  'tos'::schedule_type,
  NULL,
  'not_reviewed'::rat_status,
  E'产品经理: 周熠玮',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'recorder'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'录音耳机能力拉齐' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'日历详细月视图及小组件',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  E'8月',
  'passed'::rat_status,
  E'产品经理: 赵煜\n提出日期: 2026/05/11',
  true,
  '[{"name":"相关文档","url":"https://transsioner.feishu.cn/wiki/Hiu4wZL3EibKdnkEoWVc3sj5nxd"}]'::jsonb
FROM products p
WHERE p.code = 'calendar'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'日历详细月视图及小组件' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'My Buddy节日需求',
  '',
  p.id,
  'P1'::priority_level,
  'not_started'::requirement_status,
  'tos'::schedule_type,
  E'x月',
  'not_reviewed'::rat_status,
  E'产品经理: 赵煜',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'calendar'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'My Buddy节日需求' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'创作者生态二期',
  '',
  p.id,
  'P0'::priority_level,
  'scheduled'::requirement_status,
  'agile'::schedule_type,
  E'x月',
  'not_reviewed'::rat_status,
  E'产品经理: 赵富田',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'theme'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'创作者生态二期' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'接入钱包支付',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'agile'::schedule_type,
  E'x月',
  'not_reviewed'::rat_status,
  E'产品经理: 赵富田',
  true,
  '[]'::jsonb
FROM products p
WHERE p.code = 'theme'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'接入钱包支付' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'记事本接入 AI 检索',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  E'x月',
  'passed'::rat_status,
  E'产品经理: 邱纬晨',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'note'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'记事本接入 AI 检索' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'记事本接入 AI 知识库',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  E'x月',
  'passed'::rat_status,
  E'产品经理: 邱纬晨',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'note'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'记事本接入 AI 知识库' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'录音机搜索能力增强',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'tos'::schedule_type,
  E'x月',
  'not_reviewed'::rat_status,
  E'产品经理: 周熠玮',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'recorder'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'录音机搜索能力增强' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'录音机打标签增加图片插入能力',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'tos'::schedule_type,
  E'x月',
  'not_reviewed'::rat_status,
  E'产品经理: 周熠玮',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'recorder'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'录音机打标签增加图片插入能力' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'文本增加润色能力',
  '',
  p.id,
  'P0'::priority_level,
  'not_started'::requirement_status,
  'tos'::schedule_type,
  E'x月',
  'not_reviewed'::rat_status,
  E'产品经理: 周熠玮',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'recorder'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'文本增加润色能力' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'文管交互界面优化',
  '',
  p.id,
  'P0'::priority_level,
  'in_progress'::requirement_status,
  'agile'::schedule_type,
  E'x月',
  'not_reviewed'::rat_status,
  E'产品经理: 程茗',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'file_manager'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'文管交互界面优化' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'适配影像垃圾回收机制',
  '',
  p.id,
  'P0'::priority_level,
  'scheduled'::requirement_status,
  'agile'::schedule_type,
  E'x月',
  'not_reviewed'::rat_status,
  E'产品经理: 程茗',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'file_manager'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'适配影像垃圾回收机制' AND r.product_id = p.id
  );

INSERT INTO requirements (
  title, description, product_id, priority, status, schedule_type,
  target_delivery_month, rat_status, supplementary_notes,
  needs_data_analysis, related_files
)
SELECT
  E'负一屏拉活',
  '',
  p.id,
  'P1'::priority_level,
  'not_started'::requirement_status,
  'agile'::schedule_type,
  E'x月',
  'passed'::rat_status,
  E'',
  false,
  '[]'::jsonb
FROM products p
WHERE p.code = 'visha'
  AND NOT EXISTS (
    SELECT 1 FROM requirements r
    WHERE r.title = E'负一屏拉活' AND r.product_id = p.id
  );
