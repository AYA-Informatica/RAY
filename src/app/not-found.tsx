import Link from "next/link";
import { Button } from "@/components/ui/Button";

/** Custom 404 — never a raw Next.js page. */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-display text-6xl font-extrabold text-primary">404</p>
      <h1 className="font-display text-xl font-bold">Page not found</h1>
      <p className="text-sm text-text-secondary">
        This listing may have been sold, expired, or removed.
      </p>
      <Link href="/home">
        <Button>Back to home</Button>
      </Link>
    </main>
  );
}
