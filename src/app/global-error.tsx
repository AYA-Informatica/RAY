"use client";

/** Last-resort error boundary wrapping the html/body. */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#111111", color: "#FFFFFF", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800 }}>Something went wrong</h1>
            <p style={{ color: "#A0A0A0", marginTop: 8 }}>Please reload the app.</p>
            <button
              onClick={reset}
              style={{ marginTop: 16, background: "#E8390E", color: "#fff", border: 0, borderRadius: 9999, padding: "12px 24px", fontWeight: 700 }}
            >
              Reload
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
