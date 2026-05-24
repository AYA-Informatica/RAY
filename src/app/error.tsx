"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { logger } from "@/lib/logger";

/** Custom error boundary — shows a friendly message, never a stack trace. */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    logger.error({ message: error.message }, "Client route error");
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-5xl">⚠️</p>
      <h1 className="font-display text-xl font-bold">Something went wrong</h1>
      <p className="text-sm text-text-secondary">
        We hit a snag loading this. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
