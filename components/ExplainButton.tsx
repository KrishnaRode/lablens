"use client";

interface ExplainButtonProps {
  onExplain: () => void;
  onSample: () => void;
  onClear: () => void;
  loading: boolean;
  hasInput: boolean;
}

/** Primary action + Sample + Clear. The primary button owns the spinner. */
export default function ExplainButton({
  onExplain,
  onSample,
  onClear,
  loading,
  hasInput,
}: ExplainButtonProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onExplain}
        disabled={loading || !hasInput}
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#070912] shadow-lg shadow-accent-soft/30 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <>
            <Spinner />
            Reading…
          </>
        ) : (
          <>
            <LensIcon />
            Explain Report
          </>
        )}
        <kbd className="ml-1 hidden rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          ⌘↵
        </kbd>
      </button>

      <button
        type="button"
        onClick={onSample}
        disabled={loading}
        className="rounded-xl border border-border bg-panel px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-panel-hover hover:text-text disabled:opacity-40"
      >
        Sample
      </button>

      <button
        type="button"
        onClick={onClear}
        disabled={loading || !hasInput}
        className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-faint transition-colors hover:text-text-muted disabled:opacity-30"
      >
        Clear
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function LensIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
