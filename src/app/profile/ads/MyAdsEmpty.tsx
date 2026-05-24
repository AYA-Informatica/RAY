"use client";

import Link from "next/link";
import { PackageOpen, PlusCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/I18nProvider";

/** Translated empty state for My Ads. */
export function MyAdsEmpty() {
  const { t } = useI18n();
  return (
    <EmptyState
      icon={<PackageOpen size={36} />}
      title={t("myAds.empty")}
      description={t("myAds.emptySub")}
      action={
        <Link href="/sell">
          <Button>
            <PlusCircle size={18} /> {t("home.postAd")}
          </Button>
        </Link>
      }
    />
  );
}
