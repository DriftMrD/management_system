/** 注册页用的产品选项（与数据库种子数据 code 一致） */
export const PRODUCT_OPTIONS = [
  { code: "calendar", name: "日历" },
  { code: "document", name: "文管" },
  { code: "aiot", name: "AIoT" },
] as const;

export type ProductCode = (typeof PRODUCT_OPTIONS)[number]["code"];
