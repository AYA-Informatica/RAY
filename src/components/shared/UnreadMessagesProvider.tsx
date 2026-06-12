"use client";

import { useEffect } from "react";
import { useUnreadMessages } from "@/store/useUnreadMessages";

/** Hydrates the unread-messages store with the server-computed count on mount. */
export function UnreadMessagesProvider({ initialCount }: { initialCount: number }) {
  const setCount = useUnreadMessages((s) => s.setCount);
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount, setCount]);
  return null;
}
