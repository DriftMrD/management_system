"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import { getDropdownMenuPosition, scrollSelectedOptionIntoMenu } from "@/components/ui/dropdown-menu";

interface FilterSelectProps {
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function FilterSelect({
  label,
  value,
  options,
  disabled,
  onChange,
}: FilterSelectProps) {
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
      setMenuStyle(getDropdownMenuPosition(rect, options.length, rect.width));
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
        (event.target as Element).closest("[data-filter-select-menu]")
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="min-w-0 space-y-1.5">
      {label && (
        <span className="block text-sm font-medium text-[#1a2332]">{label}</span>
      )}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((current) => !current)}
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-[#dde6ef] bg-white px-3.5 py-2.5 text-sm text-[#1a2332]",
          "shadow-[0_1px_3px_0_rgb(90_140_180/0.06)] transition-all",
          "focus:border-[#5ba4d4] focus:outline-none focus:ring-3 focus:ring-[#5ba4d4]/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-[#5ba4d4] ring-3 ring-[#5ba4d4]/15"
        )}
      >
        <span className="truncate text-left">
          {selected?.label ?? (value || "请选择")}
        </span>
        <ChevronDown
          className={clsx(
            "h-4 w-4 shrink-0 text-[#a0b4c4] transition-transform",
            open && "rotate-180 text-[#5ba4d4]"
          )}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            data-filter-select-menu
            role="listbox"
            style={menuStyle}
            className="rounded-xl border border-[#edf3f8] bg-white py-1 shadow-[0_8px_24px_rgb(90_140_180_/_0.16)] overscroll-contain"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value || "__empty__"}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                    isSelected
                      ? "bg-[#f8fbfd] font-medium text-[#1a2332]"
                      : "text-[#3a4f60] hover:bg-[#f8fbfd]"
                  )}
                >
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#5ba4d4]" />}
                  </span>
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
