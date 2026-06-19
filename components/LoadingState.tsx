"use client";

import { useEffect, useState } from "react";

const STATUS_LINES = [
  "Reading your report…",
  "Identifying each marker…",
  "Comparing against reference ranges…",
  "Translating into plain English…",
  "Noting what stands out…",
];

/** Rotating status lines + a calm skeleton of the answer card. */
export default function LoadingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="animate-rise rounded-2xl border border-border bg-panel p-6">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 animate-soft-pulse rounded-full bg-accent" />
        <p
          key={index}
          className="animate-rise text-sm font-medium text-text-muted"
          aria-live="polite"
        >
          {STATUS_LINES[index]}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
      </div>

      <div className="mt-6 space-y-3">
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-12 w-2/3" />
      </div>
    </div>
  );
}
