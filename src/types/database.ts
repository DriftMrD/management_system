export type UserRole = "product" | "project_manager";

export type RatStatus = "not_reviewed" | "passed" | "not_applicable";

export type RequirementStatus =
  | "not_started"
  | "in_progress"
  | "scheduled"
  | "completed"
  | "cancelled";

export type ScheduleType = "tos" | "agile";

export type PriorityLevel = "P0" | "P1" | "P2";

export type SchedulePhase =
  | "prd"
  | "interaction"
  | "visual"
  | "development"
  | "testing"
  | "acceptance";

export interface Product {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  product_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RelatedFile {
  name: string;
  url: string;
}

export interface Requirement {
  id: string;
  sr_number: string | null;
  title: string;
  description: string;
  product_id: string;
  priority: PriorityLevel;
  status: RequirementStatus;
  schedule_type: ScheduleType | null;
  target_delivery_month: string | null;
  rat_status: RatStatus;
  rat_notes: string;
  supplementary_notes: string;
  needs_data_analysis: boolean;
  related_files: RelatedFile[];
  product_manager_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  products?: Product;
}

export interface RequirementFormData {
  title: string;
  description: string;
  product_id: string;
  priority: PriorityLevel;
  target_delivery_month: string;
  supplementary_notes: string;
  needs_data_analysis: boolean;
  sr_number: string;
}

export const RAT_STATUS_LABELS: Record<RatStatus, string> = {
  not_reviewed: "还未评审",
  passed: "通过",
  not_applicable: "不涉及",
};

export const REQUIREMENT_STATUS_LABELS: Record<RequirementStatus, string> = {
  not_started: "未启动",
  in_progress: "进行中",
  scheduled: "已排期",
  completed: "已完成",
  cancelled: "已取消",
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  P0: "P0",
  P1: "P1",
  P2: "P2",
};

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  tos: "TOS 版本",
  agile: "敏捷迭代",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  product: "产品经理",
  project_manager: "项管",
};

export const SCHEDULE_PHASE_LABELS: Record<SchedulePhase, string> = {
  prd: "产品需求",
  interaction: "交互设计",
  visual: "视觉设计",
  development: "开发",
  testing: "测试",
  acceptance: "产品/UI/UX验收",
};
