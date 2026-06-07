"use client";

import { motion } from "framer-motion";

/**
 * template.tsx re-mounts on every navigation (unlike layout.tsx which persists).
 * This gives every page a smooth fade-in-up entrance without touching each page file.
 * The loading.tsx skeleton appears first; once the server component is ready,
 * this animation plays as the real content replaces the skeleton.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
