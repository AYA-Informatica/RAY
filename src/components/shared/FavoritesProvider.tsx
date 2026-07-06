"use client";

import { useEffect } from "react";
import { useFavorites } from "@/store/useFavorites";
import { logger } from "@/lib/logger";

/** Hydrates the favorites store with the user's saved listing IDs on mount. */
export function FavoritesProvider({ initialIds }: { initialIds: string[] }) {
  const setInitial = useFavorites((s) => s.setInitial);
  useEffect(() => {
    logger.debug({ count: initialIds.length }, "[FavoritesProvider] favorites hydrated");
    setInitial(initialIds);
  }, [initialIds, setInitial]);
  return null;
}
