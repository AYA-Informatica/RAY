"use client";

import Image from "next/image";
import { Settings, Heart, MessageCircle, Star, Crown, HelpCircle, ShieldCheck, LayoutList, Lock } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProfileRow } from "./ProfileRow";
import { LogoutButton } from "./LogoutButton";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { useI18n } from "@/i18n/I18nProvider";

interface ProfileMenuProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  activeAds: number;
  totalViews: string;
  favourites: number;
}

/** Translated profile header, stats, premium upsell, and settings menu. */
export function ProfileMenu({ name, email, avatarUrl, activeAds, totalViews, favourites }: ProfileMenuProps) {
  const { t } = useI18n();
  return (
    <>
      {/* Orange header with avatar */}
      <div className="relative bg-primary px-4 pb-12 pt-5">
        <div className="flex items-center justify-between text-text-primary">
          <h1 className="font-display text-2xl font-bold">{t("profile.title")}</h1>
          <Link href="/profile/settings" aria-label="Settings">
            <Settings size={24} />
          </Link>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Link href="/profile/edit" className="relative h-16 w-16 overflow-hidden rounded-pill bg-surface-modal ring-2 ring-text-primary/40">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="64px" priority />
            ) : (
              <span className="grid h-full w-full place-items-center font-display text-2xl text-text-primary">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
          <div className="text-text-primary">
            <p className="font-display text-lg font-bold">{name}</p>
            <p className="text-sm opacity-90">{email}</p>
            <Link href="/profile/edit" className="mt-0.5 inline-block text-xs text-text-primary/70 underline-offset-2 hover:underline">
              {t("profileEdit.editLink")}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats card overlapping the header */}
      <div className="-mt-8 px-4">
        <Card className="grid grid-cols-3 divide-x divide-border p-0">
          <Stat value={activeAds} label={t("profile.activeAds")} />
          <Stat value={totalViews} label={t("profile.totalViews")} />
          <Stat value={favourites} label={t("profile.favourites")} />
        </Card>
      </div>

      {/* Menu */}
      <div className="mt-4 divide-y divide-border border-y border-border">
        <ProfileRow href="/profile/ads" icon={<LayoutList size={20} />} label={t("profile.myAds")} count={activeAds} />
        <ProfileRow href="/favorites" icon={<Heart size={20} />} label={t("profile.favourites")} count={favourites} />
        <ProfileRow href="/chat" icon={<MessageCircle size={20} />} label={t("nav.messages")} />
        <ProfileRow href="/profile/reviews" icon={<Star size={20} />} label={t("profile.reviews")} comingSoon />
        <ProfileRow href="/profile/premium" icon={<Crown size={20} />} label={t("profile.upgradePremium")} comingSoon />
        <ProfileRow href="/profile/settings" icon={<Settings size={20} />} label={t("profile.settings")} />
        <ProfileRow href="/profile/help" icon={<HelpCircle size={20} />} label={t("profile.help")} />
        <ProfileRow href="/profile/safety" icon={<ShieldCheck size={20} />} label={t("profile.safety")} />
        <ProfileRow href="/privacy" icon={<Lock size={20} />} label="Privacy Policy" />
        <LanguageToggle />
        <LogoutButton />
      </div>
    </>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center py-4">
      <span className="font-display text-2xl font-bold text-text-primary">{value}</span>
      <span className="text-xs text-text-secondary">{label}</span>
    </div>
  );
}
