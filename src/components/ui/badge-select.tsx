"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { badgeVariants } from "@/components/ui/badge";

interface BadgeSelectProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  variant: keyof typeof badgeVariants;
  disabled?: boolean;
  onChange: (value: T) => void;
}

export function BadgeSelect<T extends string>({
  value,
  options,
  variant,
  disabled,
  onChange,
}: BadgeSelectProps<T>) {
  return (
    <div className="relative inline-flex items-center group">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        className={clsx(
          "appearance-none rounded-full pl-2.5 pr-6 py-0.5 text-xs font-medium cursor-pointer",
          "border-0 focus:outline-none focus:ring-2 focus:ring-[#5ba4d4]/30",
          "hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed",
          badgeVariants[variant]
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={clsx(
          "absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-40",
          "group-hover:opacity-70 transition-opacity",
          disabled && "opacity-20"
        )}
      />
    </div>
  );
}
