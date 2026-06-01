"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

type Toast = { id: number; message: string; tone: "success" | "danger" | "default" };

let _next = 0;

/** Minimal toast state hook — used inside AdminActionButton. */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, tone: Toast["tone"] = "default") => {
    const id = ++_next;
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return { toasts, show };
}

/** Renders the toast stack — place once near the top of a page/layout. */
export function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-24 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2 lg:bottom-8">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "rounded-pill px-4 py-2 text-sm font-medium shadow-lg",
            t.tone === "success" && "bg-success text-white",
            t.tone === "danger"  && "bg-danger text-white",
            t.tone === "default" && "bg-surface-modal text-text-primary",
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
