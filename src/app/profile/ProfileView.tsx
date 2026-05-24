"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  Heart,
  Bell,
  Star,
  Crown,
  HelpCircle,
  ShieldCheck,
  LogOut,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

interface ProfileViewProps {
  user: { id: string; name: string | null; avatarUrl: string | null; role: string };
  stats: { activeAds: number; totalViews: number; favourites: number };
}

const MENU = [
  { icon: LayoutGrid, label: "My Ads", href: "/profile/ads", tone: "primary" as const },
  { icon: Heart, label: "Favourites", href: "/favorites", tone: "danger" as const },
  { icon: Bell, label: "Notifications", href: "/profile/notifications", tone: "navy" as const },
  { icon: Star, label: "Review & Ratings", href: "/profile/reviews", tone: "warning" as const },
  { icon: Crown, label: "Upgrade to Premium", href: "/profile/premium", tone: "primary" as const },
  { icon: Settings, label: "Settings", href: "/profile/settings", tone: "muted" as const },
  { icon: HelpCircle, label: "Help & Support", href: "/profile/support", tone: "muted" as const },
  { icon: ShieldCheck, label: "Safety Tips", href: "/profile/safety", tone: "success" as const },
];

const TONE: Record<string, string> = {
  primary: "text-primary",
  danger: "text-danger",
  navy: "text-navy",
  warning: "text-warning",
  success: "text-success",
  muted: "text-text-secondary",
};

/** My Account — mirrors the wireframe: header, stats, Premium card, menu, logout. */
export function ProfileView({ user, stats }: ProfileViewProps) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/home");
    router.refresh();
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-background pb-24">
      {/* Header */}
      <div className="relative overflow-hidden rounded-b-xl bg-primary px-5 pb-12 pt-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-text-primary">My Account</h1>
          <Link href="/profile/settings" aria-label="Settings" className="text-text-primary">
            <Settings size={22} />
          </Link>
        </div>
        <div className="mt-4 h-20 w-20 overflow-hidden rounded-pill border-2 border-text-primary/30 bg-surface-modal">
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.name ?? "You"} width={80} height={80} className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center font-display text-3xl text-text-primary">
              {(user.name ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {user.name && <p className="mt-2 font-display text-lg font-bold text-text-primary">{user.name}</p>}
      </div>

      {/* Stats card overlapping the header */}
      <div className="-mt-8 px-5">
        <Card className="grid grid-cols-3 divide-x divide-border p-4">
          <Stat label="Active Ads" value={stats.activeAds} />
          <Stat label="Total Views" value={formatViews(stats.totalViews)} />
          <Stat label="Favourites" value={stats.favourites} />
        </Card>
      </div>

      {/* Go Premium (navy = exclusivity) */}
      <div className="px-5 pt-5">
        <Card className="flex items-center justify-between border-none bg-navy p-4">
          <div>
            <p className="font-display text-lg font-bold">Go Premium</p>
            <p className="text-sm text-text-secondary">Sell 3x faster with featured listings</p>
          </div>
          <Button size="sm" className="bg-text-primary text-navy" variant="secondary">
            Upgrade
          </Button>
        </Card>
      </div>

      {/* Menu */}
      <nav className="mt-5 px-2">
        {MENU.map(({ icon: Icon, label, href, tone }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 rounded-md px-3 py-3.5 hover:bg-surface-card"
          >
            <Icon size={20} className={cn(TONE[tone])} />
            <span className={cn("flex-1 font-medium", tone === "primary" && label.includes("Premium") ? "text-primary" : "text-text-primary")}>
              {label}
            </span>
            {label === "My Ads" && <Badge value={stats.activeAds} />}
            {label === "Favourites" && <Badge value={stats.favourites} />}
            <ChevronRight size={18} className="text-text-muted" />
          </Link>
        ))}

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-3.5 text-left hover:bg-surface-card"
        >
          <LogOut size={20} className="text-primary" />
          <span className="flex-1 font-medium text-primary">Logout</span>
          <ChevronRight size={18} className="text-text-muted" />
        </button>
      </nav>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center px-2">
      <span className="font-display text-xl font-bold text-text-primary">{value}</span>
      <span className="text-xs text-text-secondary">{label}</span>
    </div>
  );
}

function Badge({ value }: { value: number }) {
  if (!value) return null;
  return (
    <span className="grid h-6 min-w-6 place-items-center rounded-pill bg-primary/15 px-2 text-xs font-bold text-primary">
      {value}
    </span>
  );
}

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
