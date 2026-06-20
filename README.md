# 需求管理系统

基于 **Next.js + Supabase** 的需求池录入与排期管理系统。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Next.js 15 (App Router) + Tailwind CSS | 部署到 Vercel，代码托管 GitHub |
| 后端 & 数据库 | Supabase | PostgreSQL + Auth + Row Level Security |
| 认证 | Supabase Auth | 邮箱密码登录，按角色隔离数据 |

## 功能（当前版本）

- **需求池录入**：产品经理录入需求（描述、产品、优先级、目标交付月等）
- **搜索 & 筛选**：全文搜索 + 按产品/状态/优先级/RAT 筛选
- **角色权限**：
  - **产品经理**：只能看自己所属产品的需求
  - **项管**：看全部产品需求，可做 RAT 评审、查看全部排期
- **RAT 评审**：项管标记通过/未评审/不涉及，通过后选择 TOS 或敏捷排期类型
- **排期入口**：RAT 通过的需求进入排期列表（甘特图录入下一阶段实现）

## 快速开始

### 1. 创建 Supabase 项目

1. 打开 [supabase.com](https://supabase.com) 注册并新建项目
2. 进入 **Project Settings → API**，复制：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. 初始化数据库

在 Supabase Dashboard → **SQL Editor** 中，执行：

```
supabase/migrations/001_initial_schema.sql
```

这会创建表结构、RLS 策略，并插入初始产品（日历、文管、AIoT）。

### 3. 配置认证（开发环境）

在 Supabase → **Authentication → Providers → Email**：

- 开发阶段建议关闭 **Confirm email**，注册后可直接登录

### 4. 本地运行

```bash
cp .env.example .env.local
# 填入 Supabase URL 和 anon key

npm install
npm run dev
```

访问 http://localhost:3000

### 5. 注册测试账号

1. 访问 `/signup`
2. 注册**产品经理**账号：选择角色「产品经理」+ 所属产品
3. 注册**项管**账号：选择角色「项管」（无需选产品）

## 部署到 GitHub + Vercel

```bash
# 推送到 GitHub
git init
git add .
git commit -m "init: requirements management system"
git remote add origin <your-repo-url>
git push -u origin main
```

在 [vercel.com](https://vercel.com)：

1. Import GitHub 仓库
2. 添加环境变量 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

在 Supabase → **Authentication → URL Configuration** 添加 Vercel 域名到 Redirect URLs。

## 数据模型

```
products          产品（日历、文管、AIoT）
profiles          用户档案（角色 + 所属产品）
requirements      需求池
schedule_tasks    排期任务（甘特图，下一阶段）
```

### 需求流转

```
录入需求 → RAT 评审 → 选择排期类型(TOS/敏捷) → 录入各阶段日期 → 甘特图展示
   ↑           ↑              ↑                      ↑
 产品同学      项管           项管                  下一阶段
```

## 路线图

- [x] 需求池 CRUD + 搜索筛选
- [x] 用户认证 + 角色权限（产品 / 项管）
- [x] RAT 评审 + TOS/敏捷分类
- [ ] 甘特图排期录入 & 可视化
- [ ] 飞书/邮件定期提醒
- [ ] 相关文档链接管理

## 项目结构

```
src/
├── app/
│   ├── login/          登录
│   ├── signup/         注册
│   ├── requirements/   需求池
│   ├── schedule/       排期（项管）
│   └── dashboard/      概览
├── components/         UI 组件
├── lib/supabase/       Supabase 客户端
└── types/              类型定义
supabase/
└── migrations/         数据库 SQL
```
