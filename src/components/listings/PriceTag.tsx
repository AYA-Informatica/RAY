import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function PriceTag({
  amount,
  suffix,
  size = "md",
  className,
}: {
  amount: number;
  suffix?: string; // e.g. "/mo" for rentals
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "text-base", md: "text-xl", lg: "text-3xl" } as const;
  return (
    <p className={cn("font-display font-bold text-text-primary", sizes[size], className)}>
      {formatPrice(amount)}
      {suffix && <span className="font-normal text-text-secondary">{suffix}</span>}
    </p>
  );
}
