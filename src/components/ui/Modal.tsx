"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  sheet?: boolean;
}

export function Modal({ open, onClose, title, children, sheet = true }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement | null;
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setMounted(false);
        previousFocus.current?.focus();
      }, 200);
      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea',
      );
      firstFocusable?.focus();
    });
    return () => document.removeEventListener("keydown", onKey);
  }, [open, mounted, onClose]);

  if (typeof document === "undefined" || !mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center sm:items-center transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={cn(
          "relative z-10 w-full max-w-md bg-surface-modal shadow-modal transition-transform duration-200 ease-out",
          sheet ? "rounded-t-xl sm:rounded-xl" : "rounded-xl",
          "max-h-[85dvh] overflow-y-auto",
          visible
            ? "translate-y-0 opacity-100"
            : sheet
              ? "translate-y-full"
              : "translate-y-4 opacity-0",
        )}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface-modal px-4 py-3">
          <h3 id="modal-title" className="font-display text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-pill p-1 text-text-secondary hover:bg-surface-card hover:text-text-primary"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
