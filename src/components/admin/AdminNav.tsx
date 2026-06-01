"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, Users, Flag } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/admin",          label: "Overview",  icon: LayoutDashboard },
  { href: "/admin/listings", label: "Listings",  icon: ListChecks },
  { href: "/admin/reports",  label: "Reports",   icon: Flag },
  { href: "/admin/users",    label: "Users",     icon: Users },
] as const;

/** Admin tab nav with pathname-driven active state. */
export function AdminNav({ urgentReports }: { urgentReports: number }) {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
      {NAV.map(({ href, label, icon: Icon }) => {
        // Exact match for /admin, prefix match for sub-pages.
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-text-secondary hover:bg-surface-modal hover:text-text-primary",
            )}
          >
            <Icon size={15} />
            {label}
            {/* Badge on Reports tab when there are open reports */}
            {label === "Reports" && urgentReports > 0 && (
              <span className="ml-0.5 rounded-pill bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                {urgentReports}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
