import { HomeContent } from "@/app/HomeContent";
import { logger } from "@/lib/logger";

export const metadata = { title: "Home" };

/** Marketplace home — delegates to the shared HomeContent server component. */
export default function HomePage() {
  logger.debug("[HomePage] rendering");
  return <HomeContent />;
}
