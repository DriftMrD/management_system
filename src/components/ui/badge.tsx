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
  if (priority === "P0") return "danger";
  if (priority === "P1") return "warning";
  return "gray";
}

export function ratStatusVariant(status: string): keyof typeof variants {
  if (status === "passed") return "success";
  if (status === "not_applicable") return "purple";
  return "default";
}

export function requirementStatusVariant(status: string): keyof typeof variants {
  if (status === "completed") return "success";
  if (status === "in_progress") return "primary";
  if (status === "scheduled") return "warning";
  if (status === "cancelled") return "danger";
  return "gray";
}
