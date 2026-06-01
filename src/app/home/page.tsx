import { HomeContent } from "@/app/HomeContent";

export const metadata = { title: "Home" };

/** Marketplace home — delegates to the shared HomeContent server component. */
export default function HomePage() {
  return <HomeContent />;
}
