/**
 * Suppress noisy development errors that can't be fixed.
 * Only runs in development mode.
 * 
 * This suppresses:
 * - webpack Fast Refresh HMR errors
 * - React double-render warnings in strict mode
 */

if (process.env.NODE_ENV === "development") {
  // Suppress webpack HMR errors in console
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const message = args[0]?.toString() || "";
    
    // Suppress webpack module errors
    if (message.includes("__webpack_modules__")) return;
    if (message.includes("updateDehydratedSuspenseComponent")) return;
    
    // Suppress CSS preload warnings
    if (message.includes("was preloaded using link preload")) return;
    
    // Call original for other errors
    originalError.apply(console, args);
  };

  // Suppress unhandled error overlay for HMR issues only
  window.addEventListener("error", (event) => {
    const message = event.message || event.error?.message || "";
    if (message.includes("__webpack_modules__")) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    const message = event.reason?.message || "";
    if (message.includes("__webpack_modules__")) {
      event.preventDefault();
    }
  });
}

export {};
