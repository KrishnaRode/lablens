"use client";

import type {
  MarkerStatus,
  ReportExplanation,
  Urgency,
} from "@/lib/types";

interface AnswerViewProps {
  data: ReportExplanation;
}

/** The answer: summary, urgency, per-marker breakdown, and next steps. */
export default function AnswerView({ data }: AnswerViewProps) {
  return (
    <div className="animate-rise space-y-5">
      {/* Summary + urgency badge */}
      <section className="rounded-2xl border border-border bg-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionLabel>Overview</SectionLabel>
          <UrgencyBadge urgency={data.urgency} />
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-text">
          {data.overallSummary}
        </p>
      </section>

      {/* What stands out */}
      {data.whatStandsOut.length > 0 && (
        <section className="rounded-2xl border border-border bg-panel p-6">
          <SectionLabel>What stands out</SectionLabel>
          <ul className="mt-3 space-y-2.5">
            {data.whatStandsOut.map((item, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-text-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Per-marker breakdown */}
      {data.results.length > 0 && (
        <section className="rounded-2xl border border-border bg-panel p-6">
          <SectionLabel>Your results, explained</SectionLabel>
          <div className="mt-4 space-y-3">
            {data.results.map((m, i) => (
              <div
                key={`${m.name}-${i}`}
                className="rounded-xl border border-border-soft bg-bg-soft p-4"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="font-semibold text-text">{m.name}</span>
                  {m.value && (
                    <span className="font-mono text-sm text-text-muted">
                      {m.value}
                    </span>
                  )}
                  <StatusPill status={m.status} />
                  {m.referenceRange && (
                    <span className="text-xs text-text-faint">
                      ref {m.referenceRange}
                    </span>
                  )}
                </div>
                {m.meaning && (
                  <p className="mt-2 text-[14.5px] leading-relaxed text-text-muted">
                    {m.meaning}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Questions for your doctor */}
      {data.questionsForYourDoctor.length > 0 && (
        <section className="rounded-2xl border border-border bg-panel p-6">
          <SectionLabel>Questions for your doctor</SectionLabel>
          <ul className="mt-3 space-y-2.5">
            {data.questionsForYourDoctor.map((q, i) => (
              <li
                key={i}
                className="flex gap-3 text-[15px] leading-relaxed text-text-muted"
              >
                <span className="mt-0.5 select-none font-mono text-sm text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Lifestyle notes */}
      {data.lifestyleNotes.length > 0 && (
        <section className="rounded-2xl border border-border bg-panel p-6">
          <SectionLabel>General lifestyle context</SectionLabel>
          <ul className="mt-3 space-y-2.5">
            {data.lifestyleNotes.map((n, i) => (
              <li
                key={i}
                className="flex gap-3 text-[15px] leading-relaxed text-text-muted"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-status-normal" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Disclaimer />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-faint">
      {children}
    </h2>
  );
}

function StatusPill({ status }: { status: MarkerStatus }) {
  const map: Record<MarkerStatus, { label: string; cls: string }> = {
    Low: { label: "Low", cls: "bg-status-low/12 text-status-low" },
    High: { label: "High", cls: "bg-status-high/12 text-status-high" },
    Normal: { label: "Normal", cls: "bg-status-normal/12 text-status-normal" },
    Borderline: { label: "Borderline", cls: "bg-status-watch/12 text-status-watch" },
    Unknown: { label: "Unclear", cls: "bg-panel-hover text-text-faint" },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const map: Record<Urgency, string> = {
    Routine: "bg-status-normal/12 text-status-normal",
    "Discuss Soon": "bg-status-watch/12 text-status-watch",
    "Seek Care Promptly": "bg-status-high/12 text-status-high",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${map[urgency]}`}
    >
      {urgency}
    </span>
  );
}

function Disclaimer() {
  return (
    <p className="rounded-xl border border-border-soft bg-bg-soft px-4 py-3 text-xs leading-relaxed text-text-faint">
      <span className="font-semibold text-text-muted">Not medical advice.</span>{" "}
      LabLens is an educational tool to help you read your report — it does not
      diagnose, treat, or replace a clinician. Always discuss your results with a
      qualified doctor, and seek urgent care for any severe or worsening symptoms.
    </p>
  );
}
