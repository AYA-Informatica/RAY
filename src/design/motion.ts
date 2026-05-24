/** Framer Motion presets. Kept subtle — low-bandwidth, no heavy animation. */
export const motionPresets = {
  fadeInUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.32, ease: "easeOut" },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 },
  },
  pressable: {
    whileTap: { scale: 0.97 },
  },
} as const;
