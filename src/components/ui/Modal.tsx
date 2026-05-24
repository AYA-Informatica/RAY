"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** On mobile, render as a bottom sheet. */
  sheet?: boolean;
}

export function Modal({ open, onClose, title, children, sheet = true }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div
            initial={{ y: sheet ? "100%" : 16, opacity: sheet ? 1 : 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: sheet ? "100%" : 16, opacity: sheet ? 1 : 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className={cn(
              "relative z-10 w-full max-w-md bg-surface-modal shadow-modal",
              sheet ? "rounded-t-xl sm:rounded-xl" : "rounded-xl",
              "max-h-[85dvh] overflow-y-auto",
            )}
          >
            {(title || true) && (
              <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface-modal px-4 py-3">
                <h3 className="font-display text-lg font-bold">{title}</h3>
                <button
                  onClick={onClose}
                  className="rounded-pill p-1 text-text-secondary hover:bg-surface-card hover:text-text-primary"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="p-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
