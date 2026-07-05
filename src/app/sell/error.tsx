"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { logger } from "@/lib/logger";

export default function SellError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    logger.error({ message: error.message }, "Sell route error");
  }, [error]);

  return (
    <main className="flex min-h-screen min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center bg-background">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface-card p-10">
        <p className="font-display text-5xl">⚠️</p>
        <h1 className="mt-4 font-display text-xl font-bold">Couldn&apos;t load the sell form</h1>
        <p className="mt-2 text-sm text-text-secondary">
          There was a problem loading the categories. Try again.
        </p>
        <div className="mt-6">
          <Button onClick={reset}>Try again</Button>
        </div>
      </div>
    </main>
  );
}
