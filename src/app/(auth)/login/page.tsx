"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Login. Per Build Prompt v2.0: Google Sign-In ONLY (Supabase Auth).
 * Phone OTP has been removed. Public browsing is allowed; this gates posting,
 * chatting, favorites and profile.
 */
export default function LoginPage() {
  const params = useSearchParams();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirect = params.get("redirect") ?? "/home";

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      if (error) throw error;
    } catch {
      setError("Could not start sign-in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center bg-background px-6">
      <div className="mb-10 text-center">
        <h1 className="font-display text-5xl font-extrabold text-primary">RAY</h1>
        <p className="mt-2 text-text-secondary">{t("splash.tagline")}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-center font-display text-xl font-bold">{t("auth.welcome")}</h2>
        <p className="text-center text-sm text-text-secondary">{t("auth.subtitle")}</p>

        <Button fullWidth size="lg" loading={loading} onClick={signInWithGoogle}>
          <GoogleIcon /> {t("auth.google")}
        </Button>

        {error && <p className="text-center text-sm text-danger">{error}</p>}

        <p className="pt-2 text-center text-xs text-text-muted">
          By continuing you agree to RAY&apos;s Terms &amp; Privacy Policy.
        </p>
      </div>
    </main>
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
