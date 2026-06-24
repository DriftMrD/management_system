-- ============================================================
-- 需求管理系统 — Supabase 数据库初始化
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本
-- ============================================================

-- 产品表
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 用户角色枚举
CREATE TYPE user_role AS ENUM ('product', 'project_manager');

-- RAT 评审状态
CREATE TYPE rat_status AS ENUM ('not_reviewed', 'passed', 'not_applicable');

-- 需求进展状态
CREATE TYPE requirement_status AS ENUM ('not_started', 'in_progress', 'scheduled', 'completed', 'cancelled');

-- 排期类型（RAT 通过后设置）
CREATE TYPE schedule_type AS ENUM ('tos', 'agile');

-- 优先级
CREATE TYPE priority_level AS ENUM ('P0', 'P1', 'P2');

-- 用户档案（关联 auth.users）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'product',
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 需求表
CREATE TABLE IF NOT EXISTS requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sr_number TEXT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  priority priority_level NOT NULL DEFAULT 'P1',
  status requirement_status NOT NULL DEFAULT 'not_started',
  schedule_type schedule_type,
  target_delivery_month TEXT,
  rat_status rat_status NOT NULL DEFAULT 'not_reviewed',
  rat_notes TEXT DEFAULT '',
  supplementary_notes TEXT DEFAULT '',
  needs_data_analysis BOOLEAN NOT NULL DEFAULT false,
  related_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  product_manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 排期阶段枚举
CREATE TYPE schedule_phase AS ENUM (
  'prd',
  'interaction',
  'visual',
  'development',
  'testing',
  'acceptance'
);

-- 排期任务表（RAT 通过后创建，后续甘特图使用）
CREATE TABLE IF NOT EXISTS schedule_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  phase schedule_phase NOT NULL,
  schedule_type schedule_type NOT NULL,
  version_label TEXT,
  start_date DATE,
  end_date DATE,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  milestone_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requirement_id, phase)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_requirements_product ON requirements(product_id);
CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements(status);
CREATE INDEX IF NOT EXISTS idx_requirements_rat ON requirements(rat_status);
CREATE INDEX IF NOT EXISTS idx_requirements_title ON requirements USING gin(to_tsvector('simple', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_profiles_product ON profiles(product_id);
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_requirement ON schedule_tasks(requirement_id);

-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER requirements_updated_at
  BEFORE UPDATE ON requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER schedule_tasks_updated_at
  BEFORE UPDATE ON schedule_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_tasks ENABLE ROW LEVEL SECURITY;

-- 辅助函数：当前用户是否为项管
CREATE OR REPLACE FUNCTION is_project_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'project_manager'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 辅助函数：当前用户所属产品
CREATE OR REPLACE FUNCTION current_user_product_id()
RETURNS UUID AS $$
  SELECT product_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- products: 登录用户可读；未登录注册页也需要读取
CREATE POLICY "products_select" ON products
  FOR SELECT USING (true);

-- profiles: 可读自己；项管可读全部
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_project_manager());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- requirements: 产品同学只看自己产品；项管看全部
CREATE POLICY "requirements_select" ON requirements
  FOR SELECT TO authenticated
  USING (
    is_project_manager()
    OR product_id = current_user_product_id()
  );

CREATE POLICY "requirements_insert" ON requirements
  FOR INSERT TO authenticated
  WITH CHECK (
    is_project_manager()
    OR product_id = current_user_product_id()
  );

CREATE POLICY "requirements_update" ON requirements
  FOR UPDATE TO authenticated
  USING (
    is_project_manager()
    OR product_id = current_user_product_id()
  );

CREATE POLICY "requirements_delete" ON requirements
  FOR DELETE TO authenticated
  USING (is_project_manager());

-- schedule_tasks: 同 requirements 权限
CREATE POLICY "schedule_tasks_select" ON schedule_tasks
  FOR SELECT TO authenticated
  USING (
    is_project_manager()
    OR EXISTS (
      SELECT 1 FROM requirements r
      WHERE r.id = requirement_id
        AND r.product_id = current_user_product_id()
    )
  );

CREATE POLICY "schedule_tasks_insert" ON schedule_tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    is_project_manager()
    OR EXISTS (
      SELECT 1 FROM requirements r
      WHERE r.id = requirement_id
        AND r.product_id = current_user_product_id()
    )
  );

CREATE POLICY "schedule_tasks_update" ON schedule_tasks
  FOR UPDATE TO authenticated
  USING (
    is_project_manager()
    OR EXISTS (
      SELECT 1 FROM requirements r
      WHERE r.id = requirement_id
        AND r.product_id = current_user_product_id()
    )
  );

-- ============================================================
-- 种子数据
-- ============================================================

INSERT INTO products (name, code) VALUES
  ('日历', 'calendar'),
  ('文管', 'document'),
  ('AIoT', 'aiot')
ON CONFLICT (code) DO NOTHING;
