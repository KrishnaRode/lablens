"use client";

import { useEffect, useMemo, useState } from "react";

const STATUS_LINES = [
  "Reading your report…",
  "Identifying each marker…",
  "Comparing against reference ranges…",
  "Translating into plain English…",
  "Noting what stands out…",
];

interface LoadingStateProps {
  /** Wellness tips to flash while waiting (already in the chosen language). */
  tips?: string[];
  /** Text direction for the tip text (rtl for Urdu). */
  dir?: "ltr" | "rtl";
  /** Localized caption above the tip, e.g. "While you wait". */
  caption?: string;
}

/** Shuffles a copy of the array (Fisher–Yates) so tips don't always start the same. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Rotating wellness tips (or status lines as a fallback) + a calm skeleton. */
export default function LoadingState({
  tips = [],
  dir = "ltr",
  caption = "Wellness tip while you wait",
}: LoadingStateProps) {
  const hasTips = tips.length > 0;
  const items = useMemo(
    () => (hasTips ? shuffle(tips) : STATUS_LINES),
    [hasTips, tips]
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const id = setInterval(
      () => setIndex((i) => (i + 1) % items.length),
      hasTips ? 4200 : 1800
    );
    return () => clearInterval(id);
  }, [items, hasTips]);

  return (
    <div className="animate-rise rounded-2xl border border-border bg-panel p-6">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 animate-soft-pulse rounded-full bg-accent" />
        <p className="text-sm font-medium text-text-muted" aria-live="polite">
          Reading your report…
        </p>
      </div>

      {hasTips ? (
        <div className="mt-5 rounded-xl border border-border-soft bg-bg-soft p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            <HeartPulseIcon />
            {caption}
          </div>
          <p
            key={index}
            dir={dir}
            className="animate-rise mt-2 text-[15px] leading-relaxed text-text"
          >
            {items[index]}
          </p>
        </div>
      ) : (
        <p
          key={index}
          className="animate-rise mt-4 text-sm text-text-muted"
          aria-live="polite"
        >
          {items[index]}
        </p>
      )}

      <div className="mt-6 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
      </div>

      <div className="mt-6 space-y-3">
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-12 w-2/3" />
      </div>
    </div>
  );
}

function HeartPulseIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 12 5 5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.7-1.5L12 14l1.5-3 1 1.5h6.27" />
    </svg>
  );
}
