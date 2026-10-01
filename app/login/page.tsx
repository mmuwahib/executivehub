"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else if (res.status === 401) {
        setError("Incorrect password.");
      } else {
        setError("Authentication service unavailable. Is the Functions host running?");
      }
    } catch {
      setError("Unable to reach authentication service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm glass-card rounded-lg p-8">
        <div className="inline-flex items-center rounded-md bg-white px-3 py-2 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Gulf Cryo" width={1600} height={782} className="h-12 w-auto" />
        </div>
        <p className="font-mono text-[11px] text-ink-faint tracking-widest uppercase mb-6">
          Executive Intelligence · Operations
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center border border-border px-3 py-2 gap-2 rounded">
            <Lock size={16} className="text-ink-faint" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent outline-none text-sm text-ink"
              autoFocus
            />
          </div>
          {error && <p className="text-[12px] text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-on text-sm font-semibold py-3 rounded hover:brightness-110 transition-all disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
