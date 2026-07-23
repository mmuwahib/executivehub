"use client";

import { useEffect, useState } from "react";

function formatZulu(date: Date): string {
  return `${date.toISOString().slice(11, 19)} ZULU`;
}

export default function ZuluClock({ className }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(formatZulu(new Date()));
    const id = setInterval(() => setTime(formatZulu(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  // Render nothing until mounted to avoid a server/client markup mismatch
  // (the server has no "current time" to render).
  if (!time) return null;

  return <span className={className}>{time}</span>;
}
