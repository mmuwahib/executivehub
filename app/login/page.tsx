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
      } else {
        setError("Incorrect password.");
      }
    } catch {
      setError("Unable to reach authentication service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container px-4">
      <div className="w-full max-w-sm bg-surface border border-outline-variant p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[20px] font-bold text-on-surface tracking-tight">
            ATC <span className="font-light">Intelligence</span>
          </span>
        </div>
        <p className="text-[13px] text-on-surface-variant mb-6">
          Enter the dashboard password to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center border border-outline-variant px-3 py-2 gap-2">
            <Lock size={16} className="text-on-surface-variant" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent outline-none text-[14px] text-on-surface"
              autoFocus
            />
          </div>
          {error && <p className="text-[12px] text-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white text-[14px] py-3 font-medium hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
