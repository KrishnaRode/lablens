import type { Language } from "./languages";
import type { ReportExplanation } from "./types";

/**
 * Builds the prompt for the model. The model must return JSON only, matching
 * the ReportExplanation shape. It must TEACH in very simple, everyday words —
 * what each marker is, what the value suggests, and what to do next — in the
 * chosen language, without ever diagnosing, prescribing, or inventing values.
 */
export function buildReportPrompt(report: string, language: Language): string {
  const languageDirective =
    language.code === "en"
      ? `Write every explanation in clear, very simple English — the kind an ordinary
person with no medical background can understand on the first read.`
      : `Write EVERY human-readable value — overallSummary, every "meaning",
whatStandsOut, questionsForYourDoctor, and lifestyleNotes — in ${language.promptName}.
Use simple, everyday spoken ${language.promptName}, the way you would explain to a
worried family member who never studied science. Do NOT write these values in English
(test names and units may stay as-is if there is no common local word). IMPORTANT: keep
all JSON KEYS in English, and keep the status/urgency enum VALUES in English exactly as
listed below — only the human-readable sentences change language.`;

  return `You are a kind, patient health-literacy helper. A person has pasted their lab/
blood test report and wants to UNDERSTAND it in the simplest possible way. You are NOT
their doctor: you must NOT diagnose, prescribe, or give treatment instructions. Your job
is to make the report easy to understand and to help them talk to a real doctor.

LANGUAGE:
${languageDirective}

Return a SINGLE JSON object — no markdown, no prose outside the JSON — matching exactly
this TypeScript shape:

{
  "overallSummary": string,            // 2-4 VERY simple sentences: what this report is, and why a doctor usually asks for it, then the overall picture
  "results": [                          // one entry per test/marker you can identify in the report
    {
      "name": string,                  // e.g. "Hemoglobin"
      "value": string,                 // EXACTLY as written, with unit, e.g. "10.2 g/dL" — never invent a number
      "referenceRange": string,        // the normal range if the report gives one, else ""
      "status": "Low" | "Normal" | "High" | "Borderline" | "Unknown",
      "meaning": string                // in VERY simple words: what this test checks, how this value compares to the normal range, and whether it looks okay or needs attention
    }
  ],
  "whatStandsOut": string[],           // the few results most worth attention, in very simple words (empty array if all normal)
  "questionsForYourDoctor": string[],  // simple, useful questions to ask a doctor
  "lifestyleNotes": string[],          // general, non-prescriptive everyday tips (food, water, sleep). Never a treatment plan.
  "urgency": "Routine" | "Discuss Soon" | "Seek Care Promptly"  // conservative; only "Seek Care Promptly" for clearly alarming values
}

HARD RULES:
- Use ONLY values present in the report. NEVER invent, estimate, or "correct" a number.
- If the report gives no reference range for a marker, set referenceRange to "" and base
  status on widely-accepted adult ranges; if unsure, use "Unknown" and say so in "meaning".
- Determine "status" by comparing the value to the reference range when present.
- Keep language EXTREMELY simple. Short sentences. No medical jargon — if a term is
  unavoidable, explain it in one easy phrase right away.
- Be calm and reassuring. Do not alarm. Do not name a disease as a conclusion; at most say
  a value "can be linked to" something and that a doctor should check it.
- "urgency" is about how soon to follow up, NOT a diagnosis. Default to "Routine" unless
  values are clearly out of range; reserve "Seek Care Promptly" for markedly abnormal results.
- If the pasted text is not actually a lab report, return a single result with status
  "Unknown" and explain in overallSummary that no recognizable lab values were found.

WRITING STYLE (explain like to a grandparent, not a textbook):
- BAD:  "Hemoglobin: low. Suggestive of anemia."
- GOOD: "Hemoglobin is the part of blood that carries oxygen. Your number is a little
         below normal, which can mean low blood (anemia). It is usually treatable — your
         doctor can find out why and help."

THE REPORT:
"""
${report}
"""

Respond with the JSON object only.`;
}

/**
 * Builds the prompt for the "wellness tips while you wait" carousel. The model
 * returns a fresh, varied batch each time (run at high temperature), in the
 * chosen language — so tips are correct per-language and effectively unique.
 */
export function buildTipsPrompt(language: Language): string {
  const langLine =
    language.code === "en"
      ? "Write the tips in simple, friendly English."
      : `Write the tips in simple, everyday ${language.promptName}. Do not use English.`;

  return `Generate 10 short, friendly everyday wellness tips for a general audience.
Mix these themes across the list: healthy eating, physical activity / exercise,
hydration, good sleep, and simple mental-wellbeing habits.

RULES:
- Each tip is ONE short, practical, positive sentence (about 6-14 words).
- General lifestyle only. NO medical claims, NO diagnosis, NO treatment, NO medicines,
  NO supplement doses, NO numbers presented as medical advice.
- Make them varied and specific — do NOT make them all about drinking water.
- No duplicates, no numbering, no emojis.
- ${langLine}

Return JSON only, exactly this shape: { "tips": ["tip one", "tip two", ...] }
with exactly 10 tips and nothing else.`;
}

/**
 * A guaranteed-valid fallback if the model output cannot be coerced at all.
 */
export function emptyExplanation(message: string): ReportExplanation {
  return {
    overallSummary: message,
    results: [],
    whatStandsOut: [],
    questionsForYourDoctor: [],
    lifestyleNotes: [],
    urgency: "Routine",
  };
}
