-- 允许项管插入产品（导入需求池数据时需要）
CREATE POLICY "products_insert_pm" ON products
  FOR INSERT TO authenticated
  WITH CHECK (is_project_manager());

CREATE POLICY "products_update_pm" ON products
  FOR UPDATE TO authenticated
  USING (is_project_manager())
  WITH CHECK (is_project_manager());

-- 补充 CSV 中的产品
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
