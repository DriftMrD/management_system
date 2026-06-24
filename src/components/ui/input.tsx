import clsx from "clsx";
import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[#1a2332]"
        >
          {label}
          {props.required && (
            <span className="text-[#e06060] ml-0.5">*</span>
          )}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          "w-full rounded-xl border border-[#dde6ef] bg-white px-3.5 py-2.5 text-sm text-[#1a2332]",
          "placeholder:text-[#a0b4c4]",
          "focus:border-[#5ba4d4] focus:outline-none focus:ring-3 focus:ring-[#5ba4d4]/15",
          "transition-all duration-150",
          "shadow-[0_1px_3px_0_rgb(90_140_180/0.06)]",
          error && "border-[#e06060] focus:ring-[#e06060]/15",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#e06060]">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[#1a2332]"
        >
          {label}
          {props.required && (
            <span className="text-[#e06060] ml-0.5">*</span>
          )}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(
          "w-full rounded-xl border border-[#dde6ef] bg-white px-3.5 py-2.5 text-sm text-[#1a2332] min-h-[90px]",
          "placeholder:text-[#a0b4c4] resize-none",
          "focus:border-[#5ba4d4] focus:outline-none focus:ring-3 focus:ring-[#5ba4d4]/15",
          "transition-all duration-150",
          "shadow-[0_1px_3px_0_rgb(90_140_180/0.06)]",
          error && "border-[#e06060] focus:ring-[#e06060]/15",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#e06060]">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className,
  id,
  ...props
}: SelectProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[#1a2332]"
        >
          {label}
          {props.required && (
            <span className="text-[#e06060] ml-0.5">*</span>
          )}
        </label>
      )}
      <select
        id={inputId}
        className={clsx(
          "w-full rounded-xl border border-[#dde6ef] bg-white px-3.5 py-2.5 text-sm text-[#1a2332]",
          "focus:border-[#5ba4d4] focus:outline-none focus:ring-3 focus:ring-[#5ba4d4]/15",
          "transition-all duration-150 cursor-pointer",
          "shadow-[0_1px_3px_0_rgb(90_140_180/0.06)]",
          error && "border-[#e06060]",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#e06060]">{error}</p>}
    </div>
  );
}
