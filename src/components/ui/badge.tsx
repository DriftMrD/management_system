import clsx from "clsx";

const variants = {
  default: "bg-[#edf3f8] text-[#5a7a94]",
  primary: "bg-[#e8f3fb] text-[#5ba4d4]",
  success: "bg-[#e8f8f2] text-[#4db896]",
  warning: "bg-[#fef5e4] text-[#c8862c]",
  danger: "bg-[#fdeaea] text-[#e06060]",
  purple: "bg-[#eeecfb] text-[#7c6cc8]",
  gray: "bg-[#f0f4f8] text-[#8aa4b8]",
};

export const badgeVariants = variants;

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-px text-xs font-medium leading-tight",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function priorityVariant(priority: string): keyof typeof variants {
  if (priority === "P0") return "danger";
  if (priority === "P1") return "warning";
  return "gray";
}

export function requirementStatusVariant(status: string): keyof typeof variants {
  if (status === "completed") return "success";
  if (status === "in_progress" || status === "in_development" || status === "testing")
    return "primary";
  if (status === "reviewed") return "purple";
  if (status === "pending_schedule") return "default";
  if (status === "scheduled") return "warning";
  if (status === "cancelled") return "danger";
  return "gray";
}

export function scheduleTypeVariant(
  type: string | null | undefined
): keyof typeof variants {
  if (type === "tos") return "primary";
  if (type === "agile") return "success";
  return "gray";
}

export function requirementSourceVariant(
  source: string | null | undefined
): keyof typeof variants {
  if (source === "user") return "primary";
  if (source === "site") return "warning";
  if (source === "other_department") return "purple";
  if (source === "internal_planning") return "success";
  return "gray";
}
