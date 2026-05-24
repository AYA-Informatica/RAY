"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftAddon, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-primary"> *</span>}
        </label>
      )}
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border bg-surface-modal px-3",
          "focus-within:border-primary",
          error ? "border-danger" : "border-border",
        )}
      >
        {leftAddon && <span className="text-text-secondary">{leftAddon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full bg-transparent text-text-primary placeholder:text-text-muted",
            "focus:outline-none",
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
});
