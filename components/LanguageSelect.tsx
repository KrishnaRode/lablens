"use client";

import { LANGUAGES } from "@/lib/languages";

interface LanguageSelectProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

/**
 * Native <select> (most accessible + mobile-friendly) for the explanation
 * language. Shows the native script name, with the English name as a hint.
 */
export default function LanguageSelect({
  value,
  onChange,
  disabled,
}: LanguageSelectProps) {
  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2.5 text-sm text-text-muted transition-colors focus-within:border-accent-soft hover:bg-panel-hover">
      <GlobeIcon />
      <span className="sr-only">Explanation language</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="cursor-pointer appearance-none bg-transparent pr-5 font-medium text-text focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Explanation language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-panel text-text">
            {l.code === "en" ? l.native : `${l.native} · ${l.label}`}
          </option>
        ))}
      </select>
      <ChevronIcon />
    </label>
  );
}

function GlobeIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-text-faint"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="pointer-events-none -ml-4 h-4 w-4 shrink-0 text-text-faint"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
