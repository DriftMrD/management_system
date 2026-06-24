import clsx from "clsx";
import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary:
    "bg-[#5ba4d4] text-white hover:bg-[#4990c4] shadow-[0_2px_8px_0_rgb(91_164_212/0.30)]",
  secondary:
    "bg-white border border-[#dde6ef] text-[#1a2332] hover:bg-[#f0f7fc] shadow-[0_1px_3px_0_rgb(90_140_180/0.08)]",
  ghost:
    "text-[#7a96ae] hover:bg-[#e8f3fb] hover:text-[#5ba4d4]",
  danger:
    "bg-[#e06060] text-white hover:bg-[#cc5050] shadow-[0_2px_8px_0_rgb(224_96_96/0.25)]",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ba4d4]/50 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
