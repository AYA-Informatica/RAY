import { Suspense } from "react";
import { serverT } from "@/i18n/server";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const tagline = await serverT("splash.tagline");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 lg:bg-background">
      <div className="w-full max-w-sm rounded-2xl bg-background p-8 lg:border lg:border-border lg:bg-surface-card lg:shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
        <div className="mb-8 text-center">
          <h1 className="font-display text-5xl font-extrabold text-primary">RAY</h1>
          <p className="mt-2 text-text-secondary">{tagline}</p>
        </div>
        <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-surface-card" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
