"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/lib/icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm glass-card rounded-lg p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center mx-auto mb-5">
          <Icon name="warning" size={26} className="text-danger" />
        </div>
        <h1 className="text-headline-md text-ink mb-2">Something went wrong</h1>
        <p className="text-sm text-ink-muted mb-6">
          The dashboard hit an unexpected error. You can try again, or head back to the main dashboard.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full bg-accent text-accent-on text-sm font-semibold py-3 rounded hover:brightness-110 transition-all"
          >
            Try again
          </button>
          <Link
            href="/"
            className="w-full border border-border text-ink-muted text-sm font-semibold py-3 rounded hover:text-ink hover:bg-panel-highest/50 transition-all"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
