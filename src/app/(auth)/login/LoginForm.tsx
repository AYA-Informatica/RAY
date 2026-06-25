"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";

export function LoginForm() {
  const params = useSearchParams();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rawRedirect = params.get("redirect") ?? "/home";
  const redirect =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") && !rawRedirect.includes(":")
      ? rawRedirect
      : "/home";

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      if (error) throw error;
    } catch {
      setError(t("auth.signInError"));
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-center font-display text-xl font-bold">{t("auth.welcome")}</h2>
      <p className="text-center text-sm text-text-secondary">{t("auth.subtitle")}</p>

      <Button fullWidth size="lg" loading={loading} onClick={signInWithGoogle}>
        <GoogleIcon /> {t("auth.google")}
      </Button>

      {error && <p className="text-center text-sm text-danger">{error}</p>}

      <p className="pt-2 text-center text-xs text-text-muted">
        By continuing you agree to RAY&apos;s{" "}
        <Link href="/privacy" className="text-primary underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#FFFFFF"
        d="M12 11v2.8h4.6c-.2 1.2-1.4 3.5-4.6 3.5-2.8 0-5-2.3-5-5.1S9.2 7 12 7c1.6 0 2.6.7 3.2 1.2l2.2-2.1C16 4.8 14.2 4 12 4 7.6 4 4 7.6 4 12s3.6 8 8 8c4.6 0 7.7-3.2 7.7-7.8 0-.5 0-.9-.1-1.2H12z"
      />
    </svg>
  );
}
