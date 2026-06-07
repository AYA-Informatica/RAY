import { Skeleton } from "@/components/ui/Skeleton";

export default function SellLoading() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background">
      {/* Header + progress */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="ml-auto h-4 w-8" />
        </div>
        <div className="mt-3 flex gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-1 flex-1 rounded-full" />
          ))}
        </div>
      </div>
      {/* Category grid */}
      <div className="grid grid-cols-3 gap-4 p-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}
