"use client";

interface ReportInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

/**
 * A clean, monospace "report window" textarea — lab reports are tabular,
 * so a fixed-width font keeps columns readable. ⌘/Ctrl+Enter submits.
 */
export default function ReportInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: ReportInputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="group rounded-2xl border border-border bg-panel shadow-2xl shadow-black/40 transition-colors focus-within:border-accent-soft">
      {/* window header */}
      <div className="flex items-center gap-2 border-b border-border-soft px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]/70" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]/70" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]/70" />
        <span className="ml-2 text-xs font-medium tracking-wide text-text-faint">
          your-report.txt
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        spellCheck={false}
        rows={12}
        placeholder={
          "Paste your lab report here — e.g.\n\nHemoglobin        10.2 g/dL     (13.0 - 17.0)\nLDL Cholesterol   158 mg/dL     (< 100)\nFasting Glucose   112 mg/dL     (70 - 100)"
        }
        className="block w-full resize-y bg-transparent px-4 py-4 font-mono text-[13.5px] leading-relaxed text-text placeholder:text-text-faint focus:outline-none disabled:opacity-60"
        aria-label="Lab report text"
      />
    </div>
  );
}
