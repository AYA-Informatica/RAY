import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

/** A single tappable row in the profile menu (matches wireframe). */
export function ProfileRow({
  href,
  icon,
  label,
  count,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-card"
    >
      <span className={highlight ? "text-primary" : "text-text-secondary"}>{icon}</span>
      <span className={highlight ? "font-medium text-primary" : "font-medium text-text-primary"}>
        {label}
      </span>
      <span className="ml-auto flex items-center gap-2">
        {count != null && <Badge tone="primary">{count}</Badge>}
        <span className="text-text-muted">›</span>
      </span>
    </Link>
  );
}
