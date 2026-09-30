import Link from "next/link";
import { Icon } from "@/lib/icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm glass-card rounded-lg p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-panel-highest border border-border flex items-center justify-center mx-auto mb-5">
          <Icon name="public" size={26} className="text-ink-faint" />
        </div>
        <h1 className="text-headline-md text-ink mb-2">Page not found</h1>
        <p className="text-sm text-ink-muted mb-6">
          This page doesn&apos;t exist, or the link may be out of date.
        </p>
        <Link
          href="/"
          className="inline-block w-full bg-accent text-accent-on text-sm font-semibold py-3 rounded hover:brightness-110 transition-all"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
