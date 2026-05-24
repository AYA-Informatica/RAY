"use client";

import { useEffect } from "react";
import { useFavorites } from "@/store/useFavorites";

/** Hydrates the favorites store with the user's saved listing IDs on mount. */
export function FavoritesProvider({ initialIds }: { initialIds: string[] }) {
  const setInitial = useFavorites((s) => s.setInitial);
  useEffect(() => {
    setInitial(initialIds);
  }, [initialIds, setInitial]);
  return null;
}
