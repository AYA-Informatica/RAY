import { Skeleton } from "@/components/ui/Skeleton";

export default function ChatLoading() {
  return (
    <div className="min-h-dvh bg-background pb-24 lg:pb-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="border-b border-border px-4 py-3">
          <Skeleton className="h-6 w-24" />
        </div>

        {/* Search bar */}
        <div className="border-b border-border px-4 py-2">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>

        {/* Conversation rows */}
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
