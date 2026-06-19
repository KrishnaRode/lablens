"use client";

interface ErrorMessageProps {
  message: string;
  hint?: string;
  onRetry: () => void;
}

/** Friendly, code-aware error with the fix and a retry. */
export default function ErrorMessage({
  message,
  hint,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="animate-rise rounded-2xl border border-status-high/30 bg-status-high/5 p-6">
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-status-high"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text">{message}</p>
          {hint && (
            <p className="mt-1.5 font-mono text-[12.5px] leading-relaxed text-text-muted">
              {hint}
            </p>
          )}
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-lg border border-border bg-panel px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-panel-hover"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
