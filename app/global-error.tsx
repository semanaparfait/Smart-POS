"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

// Shown when a page crashes; the error goes to error tracking.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f4f5ef", color: "#20283b" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <h1 style={{ fontSize: 22, margin: 0 }}>Something went wrong</h1>
            <p style={{ fontSize: 14, opacity: 0.65, marginTop: 8 }}>We&apos;ve been told about it. Try again, or go back to the home page.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
              <button onClick={reset} style={{ height: 40, padding: "0 16px", borderRadius: 12, border: 0, background: "#20283b", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                Try again
              </button>
              <Link href="/" style={{ height: 40, padding: "0 16px", borderRadius: 12, border: "1px solid rgba(32,40,59,0.15)", color: "#20283b", fontWeight: 600, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                Home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
