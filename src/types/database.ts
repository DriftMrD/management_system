export type UserRole = "product" | "project_manager" | "developer";

/** 产品经理、研发：绑定产品，只能操作所属产品需求 */
export function isProductScopedRole(role: UserRole): boolean {
  return role === "product" || role === "developer";
}

export function requiresProductSelection(role: UserRole): boolean {
  return isProductScopedRole(role);
}

export type RequirementStatus =
  | "not_started"
  | "in_progress"
  | "reviewed"
  | "pending_schedule"
  | "scheduled"
  | "in_development"
  | "testing"
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

export type RequirementSource =
  | "other_department"
  | "site"
  | "user"
  | "internal_planning";

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
  landing_version: string | null;
  supplementary_notes: string;
  needs_data_analysis: boolean;
  related_files: RelatedFile[];
  source: RequirementSource | null;
  ai_prd_url: string;
  ai_tracking_url: string;
  ai_demo_url: string;
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
  landing_version: string;
  supplementary_notes: string;
  needs_data_analysis: boolean;
  sr_number: string;
  source: RequirementSource | "" | null;
  ai_prd_url: string;
  ai_tracking_url: string;
  ai_demo_url: string;
  schedule_type?: ScheduleType | "" | null;
}

export const REQUIREMENT_STATUS_LABELS: Record<RequirementStatus, string> = {
  not_started: "未启动",
  in_progress: "进行中",
  reviewed: "已评审",
  pending_schedule: "待排期",
  scheduled: "已排期",
  in_development: "开发中",
  testing: "测试中",
  completed: "已完成",
  cancelled: "已取消",
};

export const REQUIREMENT_STATUS_ORDER = Object.keys(
  REQUIREMENT_STATUS_LABELS
) as RequirementStatus[];

const DEVELOPER_STATUS_CUTOFF: RequirementStatus = "pending_schedule";

/** 进展是否晚于「待排期」（研发可编辑的范围） */
export function isStatusAfterDeveloperCutoff(status: RequirementStatus): boolean {
  return (
    REQUIREMENT_STATUS_ORDER.indexOf(status) >
    REQUIREMENT_STATUS_ORDER.indexOf(DEVELOPER_STATUS_CUTOFF)
  );
}

export function getDeveloperEditableStatuses(): RequirementStatus[] {
  const cutoffIdx = REQUIREMENT_STATUS_ORDER.indexOf(DEVELOPER_STATUS_CUTOFF);
  return REQUIREMENT_STATUS_ORDER.slice(cutoffIdx + 1);
}

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
  developer: "研发",
};

export const SCHEDULE_PHASE_LABELS: Record<SchedulePhase, string> = {
  prd: "产品需求",
  interaction: "交互设计",
  visual: "视觉设计",
  development: "开发",
  testing: "测试",
  acceptance: "产品/UI/UX验收",
};

export const REQUIREMENT_SOURCE_LABELS: Record<RequirementSource, string> = {
  other_department: "其他部门",
  site: "站点",
  user: "用户",
  internal_planning: "内部规划",
};
