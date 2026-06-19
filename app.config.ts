/**
 * ─────────────────────────────────────────────────────────────
 *  PRODUCT IDENTITY  —  LabLens
 * ─────────────────────────────────────────────────────────────
 *  Single source of truth for branding & model config.
 *  Mirrors the table in project.md.
 *  run.sh / run.bat read `defaultModel` automatically.
 */
export const appConfig = {
  /** Product name shown in the hero + browser tab. */
  name: "LabLens",

  /** One-line value proposition under the title. */
  tagline: "Understand your blood & lab reports in plain English — privately, on your own machine.",

  /** Longer description for <meta> tags + README. */
  description:
    "LabLens reads your medical lab report and explains every marker in warm, plain English — what it measures, whether it's high or low, what stands out, and what to ask your doctor. It runs entirely locally with Ollama, so your health data never leaves your computer. Educational only — not medical advice.",

  /** The Ollama model pulled + used by default (run.sh/run.bat read this). */
  defaultModel: "qwen2.5",

  /** Series branding — keep as-is. */
  series: "Free AI. Real Problems. Every Sunday.",

  /** Public repo URL. */
  repoUrl: "https://github.com/KrishnaRode/lablens",
} as const;

export type AppConfig = typeof appConfig;
