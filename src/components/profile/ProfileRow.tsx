import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

/**
 * A single tappable row in the profile menu (matches wireframe).
 *
 * When `comingSoon` is true, the row renders as a disabled-looking link
 * with a "Coming soon" badge so users don't tap into a placeholder page.
 * The label is still readable (text-secondary, not muted) so the menu
 * stays scannable.
 */
export function ProfileRow({
  href,
  icon,
  label,
  count,
  highlight,
  comingSoon,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  highlight?: boolean;
  comingSoon?: boolean;
}) {
  const inner = (
    <>
      <span className={highlight ? "text-primary" : "text-text-secondary"}>{icon}</span>
      <span
        className={
          comingSoon
            ? "font-medium text-text-secondary"
            : highlight
              ? "font-medium text-primary"
              : "font-medium text-text-primary"
        }
      >
        {label}
      </span>
      <span className="ml-auto flex items-center gap-2">
        {comingSoon ? (
          <Badge tone="muted" className="text-text-secondary">
            Coming soon
          </Badge>
        ) : (
          <>
            {count != null && <Badge tone="primary">{count}</Badge>}
            <span className="text-text-secondary">›</span>
          </>
        )}
      </span>
    </>
  );

  // Coming-soon rows are non-interactive: no aria role, no navigation, no hover.
  if (comingSoon) {
    return (
      <div className="flex cursor-not-allowed items-center gap-3 px-4 py-3.5 opacity-70" aria-disabled="true">
        {inner}
      </div>
    );
  }

  return (
    <Link href={href} className="flex min-h-[48px] items-center gap-3 px-4 py-3.5 hover:bg-surface-card">
      {inner}
    </Link>
  );
}
