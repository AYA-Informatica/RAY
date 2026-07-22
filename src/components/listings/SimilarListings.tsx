import Link from "next/link";
import Image from "next/image";
import { getSimilarListings } from "@/services/listings";
import { PriceTag } from "./PriceTag";
import { serverT } from "@/i18n/server";
import { timeAgo } from "@/lib/utils/format";

interface Props {
  categoryId: string;
  excludeId: string;
}

export async function SimilarListings({ categoryId, excludeId }: Props) {
  const listings = await getSimilarListings(categoryId, excludeId, 8);
  if (listings.length === 0) return null;

  const label = await serverT("listing.similar");

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-6 lg:px-8">
      <h2 className="mb-3 font-display text-lg font-bold">{label}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {listings.map((l) => (
          <Link
            key={l.id}
            href={`/listing/${l.id}`}
            className="group w-40 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-card transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-square w-full bg-surface-modal">
              {l.coverImage ? (
                <Image
                  src={l.coverImage}
                  alt={l.title}
                  fill
                  sizes="160px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-3xl">{l.category.icon}</span>
              )}
            </div>
            <div className="p-2">
              <p className="line-clamp-2 text-xs font-medium leading-tight text-text-primary">{l.title}</p>
              <PriceTag amount={l.price} size="sm" className="mt-1" />
              <p className="mt-0.5 text-[10px] text-text-muted">{timeAgo(l.createdAt)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
