import { cn } from "@/lib/utils/cn";

/** Shimmer placeholder for loading states (low-bandwidth friendly). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-md", className)} aria-hidden />;
}
