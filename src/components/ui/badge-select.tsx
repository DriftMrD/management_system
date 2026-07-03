"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import { badgeVariants } from "@/components/ui/badge";
import { getDropdownMenuPosition, scrollSelectedOptionIntoMenu } from "@/components/ui/dropdown-menu";

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
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = options.find((opt) => opt.value === value);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuStyle(getDropdownMenuPosition(rect, options.length));
    };

    updatePosition();

    requestAnimationFrame(() => {
      if (menuRef.current) {
        scrollSelectedOptionIntoMenu(menuRef.current);
      }
    });

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        (event.target as Element).closest("[data-badge-select-menu]")
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((current) => !current)}
        className={clsx(
          "inline-flex items-center gap-0.5 rounded-full pl-2 pr-1 py-px text-xs font-medium leading-tight",
          "border-0 focus:outline-none focus:ring-2 focus:ring-[#5ba4d4]/30",
          "hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed",
          badgeVariants[variant]
        )}
      >
        <span>{selected?.label ?? value}</span>
        <ChevronDown
          className={clsx(
            "w-3 h-3 opacity-50 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            data-badge-select-menu
            role="listbox"
            style={menuStyle}
            className="rounded-xl border border-[#edf3f8] bg-white py-1 shadow-[0_8px_24px_rgb(90_140_180_/_0.16)] overscroll-contain"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors",
                    isSelected
                      ? "bg-[#f8fbfd] font-medium text-[#1a2332]"
                      : "text-[#3a4f60] hover:bg-[#f8fbfd]"
                  )}
                >
                  <span className="flex h-3 w-3 shrink-0 items-center justify-center">
                    {isSelected && <Check className="h-3 w-3 text-[#5ba4d4]" />}
                  </span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
