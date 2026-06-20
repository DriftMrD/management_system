import clsx from "clsx";

const variants = {
  default: "bg-slate-100 text-slate-700",
  primary: "bg-blue-100 text-blue-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  purple: "bg-violet-100 text-violet-700",
  gray: "bg-slate-100 text-slate-500",
};

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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function priorityVariant(priority: string): keyof typeof variants {
  if (priority === "P0") return "primary";
  if (priority === "P1") return "default";
  return "gray";
}

export function ratStatusVariant(status: string): keyof typeof variants {
  if (status === "passed") return "success";
  if (status === "not_applicable") return "purple";
  return "gray";
}

export function requirementStatusVariant(status: string): keyof typeof variants {
  if (status === "completed") return "success";
  if (status === "in_progress") return "primary";
  if (status === "scheduled") return "warning";
  if (status === "cancelled") return "danger";
  return "gray";
}
