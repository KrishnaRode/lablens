import {
  MARKER_STATUSES,
  URGENCY_LEVELS,
  type MarkerResult,
  type MarkerStatus,
  type ReportExplanation,
  type Urgency,
} from "./types";

const OLLAMA_HOST = process.env.OLLAMA_HOST ?? "http://localhost:11434";
const GENERATE_URL = `${OLLAMA_HOST}/api/generate`;
const TAGS_URL = `${OLLAMA_HOST}/api/tags`;
const REQUEST_TIMEOUT_MS = 120_000;

/**
 * Preference order when the requested model isn't installed: pick the best
 * already-present general-purpose model rather than forcing a download.
 * (Coder-tuned models sit last — fine as a fallback, not ideal for prose.)
 */
const MODEL_PREFERENCE = [
  "qwen2.5",
  "qwen",
  "llama3.1",
  "llama3",
  "gemma2",
  "gemma",
  "mistral",
  "phi",
  "llama3.2",
  "qwen2.5-coder",
];

interface OllamaTag {
  name: string;
}

/** Lists models installed in the local Ollama (empty array on any failure). */
export async function listInstalledModels(): Promise<string[]> {
  try {
    const res = await fetch(TAGS_URL, { method: "GET" });
    if (!res.ok) return [];
    const data = (await res.json()) as { models?: OllamaTag[] };
    return (data.models ?? []).map((m) => m.name).filter(Boolean);
  } catch {
    return [];
  }
}

/** True if an installed entry (e.g. "qwen2.5:latest") satisfies `requested`. */
function installedMatches(installed: string, requested: string): boolean {
  if (installed === requested) return true;
  // a tag-less request ("qwen2.5") is satisfied by "qwen2.5:<tag>"
  if (!requested.includes(":") && installed.startsWith(`${requested}:`)) return true;
  return false;
}

/**
 * Resolves the model to actually use: the requested one if installed, else the
 * best already-installed model by preference, else the request as-is (so the
 * generate call surfaces a friendly "pull it first" error). This lets the app
 * run on whatever the user already has — no surprise multi-GB downloads.
 */
export async function resolveModel(requested: string): Promise<string> {
  const installed = await listInstalledModels();
  if (installed.length === 0) return requested;

  const exact = installed.find((m) => installedMatches(m, requested));
  if (exact) return exact;

  for (const pref of MODEL_PREFERENCE) {
    const hit = installed.find((m) => m === pref || m.startsWith(`${pref}:`));
    if (hit) return hit;
  }
  return installed[0];
}

/** Thrown for known, user-presentable failure modes. */
export class OllamaError extends Error {
  hint?: string;
  status: number;
  constructor(message: string, opts: { hint?: string; status?: number } = {}) {
    super(message);
    this.name = "OllamaError";
    this.hint = opts.hint;
    this.status = opts.status ?? 502;
  }
}

interface OllamaGenerateResponse {
  response?: string;
  error?: string;
}

/**
 * Calls Ollama's /api/generate with stream:false and format:"json", then
 * defensively parses + coerces the result into a guaranteed-valid
 * ReportExplanation. Retries once on transient/parse failures.
 */
export async function generateExplanation(
  prompt: string,
  model: string
): Promise<ReportExplanation> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callOllama(prompt, model);
      return coerceExplanation(extractJson(raw));
    } catch (err) {
      lastErr = err;
      // Don't retry hard failures (offline, model missing) — only parse/transient.
      if (err instanceof OllamaError && err.status !== 422) throw err;
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new OllamaError("The AI response could not be understood.", { status: 422 });
}

async function callOllama(prompt: string, model: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(GENERATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: "json",
        options: { temperature: 0.2 },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new OllamaError("The request to the local model timed out.", {
        hint: "Large reports can be slow on first run. Try again, or use a smaller model.",
        status: 504,
      });
    }
    throw new OllamaError("Ollama is not running.", {
      hint: "Start it using: ollama serve",
      status: 503,
    });
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 404) {
    throw new OllamaError(`The model is not installed.`, {
      hint: `Pull it first: ollama pull ${model}`,
      status: 404,
    });
  }
  if (!res.ok) {
    const body = await safeText(res);
    throw new OllamaError("The local model returned an error.", {
      hint: body || `HTTP ${res.status}`,
      status: 502,
    });
  }

  const data = (await res.json()) as OllamaGenerateResponse;
  if (data.error) {
    const missing = /not found|no such model/i.test(data.error);
    throw new OllamaError(
      missing ? "The model is not installed." : "The local model returned an error.",
      {
        hint: missing ? `Pull it first: ollama pull ${model}` : data.error,
        status: missing ? 404 : 502,
      }
    );
  }
  if (!data.response) {
    throw new OllamaError("The model returned an empty response.", { status: 422 });
  }
  return data.response;
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return "";
  }
}

/** Strips code fences and extracts the first balanced JSON object. */
function extractJson(raw: string): unknown {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();

  const start = text.indexOf("{");
  if (start === -1) {
    throw new OllamaError("The AI response did not contain JSON.", { status: 422 });
  }

  let depth = 0;
  let inStr = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const candidate = text.slice(start, i + 1);
        try {
          return JSON.parse(candidate);
        } catch {
          throw new OllamaError("The AI response was not valid JSON.", { status: 422 });
        }
      }
    }
  }
  throw new OllamaError("The AI response JSON was incomplete.", { status: 422 });
}

/** Coerces arbitrary parsed JSON into a guaranteed-valid ReportExplanation. */
function coerceExplanation(parsed: unknown): ReportExplanation {
  const obj = (parsed ?? {}) as Record<string, unknown>;

  return {
    overallSummary: asString(obj.overallSummary, "No summary was provided."),
    results: asArray(obj.results).map(coerceMarker).filter((m) => m.name.length > 0),
    whatStandsOut: asStringArray(obj.whatStandsOut),
    questionsForYourDoctor: asStringArray(obj.questionsForYourDoctor),
    lifestyleNotes: asStringArray(obj.lifestyleNotes),
    urgency: asEnum<Urgency>(obj.urgency, URGENCY_LEVELS, "Routine"),
  };
}

function coerceMarker(raw: unknown): MarkerResult {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    name: asString(o.name, ""),
    value: asString(o.value, ""),
    referenceRange: asString(o.referenceRange, ""),
    status: asEnum<MarkerStatus>(o.status, MARKER_STATUSES, "Unknown"),
    meaning: asString(o.meaning, ""),
  };
}

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : fallback;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function asStringArray(v: unknown): string[] {
  return asArray(v)
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((x) => x.length > 0);
}

function asEnum<T extends string>(
  v: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  return typeof v === "string" && (allowed as readonly string[]).includes(v)
    ? (v as T)
    : fallback;
}
