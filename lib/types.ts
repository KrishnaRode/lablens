/**
 * The structured result LabLens renders as one calm answer card.
 * The model is instructed to return JSON matching `ReportExplanation`.
 * Everything is coerced into this guaranteed-valid shape before render.
 */

export const MARKER_STATUSES = [
  "Low",
  "Normal",
  "High",
  "Borderline",
  "Unknown",
] as const;
export type MarkerStatus = (typeof MARKER_STATUSES)[number];

export const URGENCY_LEVELS = [
  "Routine",
  "Discuss Soon",
  "Seek Care Promptly",
] as const;
export type Urgency = (typeof URGENCY_LEVELS)[number];

export interface MarkerResult {
  /** Test/marker name, e.g. "Hemoglobin". */
  name: string;
  /** Measured value with unit as it appears, e.g. "10.2 g/dL". */
  value: string;
  /** Reference / normal range, e.g. "13.0–17.0 g/dL". Empty if not given. */
  referenceRange: string;
  /** Where the value sits relative to the range. */
  status: MarkerStatus;
  /** Plain-English: what this marker is and what this value suggests. */
  meaning: string;
}

export interface ReportExplanation {
  /** 2–4 plain-English sentences: what the report is and the big picture. */
  overallSummary: string;
  /** Per-marker breakdown. */
  results: MarkerResult[];
  /** The notable highs/lows worth attention, in plain language. */
  whatStandsOut: string[];
  /** Specific, useful questions to take to a doctor. */
  questionsForYourDoctor: string[];
  /** General, non-prescriptive lifestyle context (never a treatment plan). */
  lifestyleNotes: string[];
  /** A calm, conservative sense of how soon to follow up. */
  urgency: Urgency;
  /** The local model that actually generated this (set server-side). */
  modelUsed?: string;
  /** Language code the explanation was written in (set server-side). */
  language?: string;
}

export interface ExplainRequest {
  /** The raw pasted lab report text. */
  report: string;
  /** Optional model override; defaults to appConfig.defaultModel. */
  model?: string;
  /** Language code to explain in (see lib/languages.ts); defaults to English. */
  language?: string;
}

export interface ApiError {
  error: string;
  hint?: string;
}
