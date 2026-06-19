"use client";

import { useCallback, useState } from "react";
import { appConfig } from "@/app.config";
import AnswerView from "@/components/AnswerView";
import ErrorMessage from "@/components/ErrorMessage";
import ExplainButton from "@/components/ExplainButton";
import LanguageSelect from "@/components/LanguageSelect";
import LoadingState from "@/components/LoadingState";
import ReportInput from "@/components/ReportInput";
import { DEFAULT_LANGUAGE } from "@/lib/languages";
import { SAMPLE_REPORT } from "@/lib/sample";
import type { ApiError, ReportExplanation } from "@/lib/types";

type Status = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [report, setReport] = useState("");
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ReportExplanation | null>(null);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(
    null
  );

  const explain = useCallback(async () => {
    const trimmed = report.trim();
    if (!trimmed) return;

    setStatus("loading");
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/explain-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report: trimmed,
          model: appConfig.defaultModel,
          language,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as ApiError | null;
        setError({
          message: data?.error ?? "Something went wrong.",
          hint: data?.hint,
        });
        setStatus("error");
        return;
      }

      const data = (await res.json()) as ReportExplanation;
      setResult(data);
      setStatus("success");
    } catch {
      setError({
        message: "Could not reach the app's API.",
        hint: "Check that the dev server is running, then try again.",
      });
      setStatus("error");
    }
  }, [report, language]);

  const loadSample = useCallback(() => {
    setReport(SAMPLE_REPORT);
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  const clear = useCallback(() => {
    setReport("");
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[900px] flex-col px-5 py-14 sm:py-20">
      {/* Series chip */}
      <div className="mb-8 flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-panel/60 px-3.5 py-1.5 text-xs font-medium text-text-muted backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {appConfig.series}
        </span>
      </div>

      {/* Logo + title + tagline */}
      <header className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-full bg-accent-soft/25 blur-2xl" />
            <MicroscopeLogo />
          </div>
        </div>
        <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
          <span className="text-text">Lab</span>
          <span className="text-accent">Lens</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-[15px] leading-relaxed text-text-muted sm:text-base">
          {appConfig.tagline}
        </p>
        <p className="mx-auto mt-3 inline-flex items-center gap-2 text-xs text-text-faint">
          <LockIcon />
          Runs entirely on your machine — your report never leaves your computer.
        </p>
      </header>

      {/* Input */}
      <section className="mt-10">
        <ReportInput
          value={report}
          onChange={setReport}
          onSubmit={explain}
          disabled={status === "loading"}
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ExplainButton
            onExplain={explain}
            onSample={loadSample}
            onClear={clear}
            loading={status === "loading"}
            hasInput={report.trim().length > 0}
          />
          <div className="ml-auto">
            <LanguageSelect
              value={language}
              onChange={setLanguage}
              disabled={status === "loading"}
            />
          </div>
        </div>
      </section>

      {/* Answer */}
      <section className="mt-8">
        {status === "loading" && <LoadingState />}
        {status === "error" && error && (
          <ErrorMessage
            message={error.message}
            hint={error.hint}
            onRetry={explain}
          />
        )}
        {status === "success" && result && <AnswerView data={result} />}
        {status === "idle" && <EmptyState />}
      </section>

      <footer className="mt-16 text-center text-xs text-text-faint">
        {appConfig.name} · Educational only, not medical advice · Local AI via Ollama
      </footer>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-panel/40 px-6 py-10 text-center">
      <p className="text-sm text-text-muted">
        Paste a blood or lab report above, then press{" "}
        <span className="font-medium text-text">Explain Report</span>.
      </p>
      <p className="mt-2 text-xs text-text-faint">
        New here? Click <span className="font-medium text-text-muted">Sample</span>{" "}
        to see it work on a real report.
      </p>
    </div>
  );
}

function MicroscopeLogo() {
  return (
    <svg
      className="h-20 w-20 text-accent drop-shadow-[0_0_20px_rgba(109,139,255,0.35)] sm:h-24 sm:w-24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="LabLens microscope logo"
      role="img"
    >
      <path d="M6 18h8" />
      <path d="M3 22h18" />
      <path d="M14 22a7 7 0 1 0 0-14h-1" />
      <path d="M9 14h2" />
      <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
      <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
