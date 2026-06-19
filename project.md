# Project Definition — LabLens

> Built from the **Free AI. Real Problems. Every Sunday.** template.

---

## 1. Identity (placeholders → `app.config.ts`)

| Placeholder            | Value                                                                 |
| ---------------------- | --------------------------------------------------------------------- |
| `{{PRODUCT_NAME}}`     | LabLens                                                               |
| `{{TAGLINE}}`          | Understand your blood & lab reports in plain English — privately, on your own machine. |
| `{{DESCRIPTION}}`      | Reads a medical lab report and explains every marker in plain English — what it measures, whether it's high or low, what stands out, and what to ask your doctor. Local-only. |
| `{{OLLAMA_MODEL}}`     | `qwen2.5`                                                             |
| `{{REPO_URL}}`         | https://github.com/KrishnaRode/lablens                                |
| `{{API_ROUTE}}`        | `/api/explain-report`                                                 |
| `{{PRIMARY_INPUT}}`    | a lab / blood test report (pasted text)                               |
| `{{PRIMARY_ACTION}}`   | Explain Report                                                        |

---

## 2. The problem this solves

People get lab reports as a wall of numbers with cryptic ranges and zero explanation,
then wait days to ask a doctor what any of it means. The obvious fix — paste it into a
cloud AI — means uploading sensitive health data to a third party, which most people
(rightly) won't do. LabLens explains the report in warm, plain English **entirely on
your own machine** via Ollama, so nothing ever leaves your computer. It is a literacy
tool, not a diagnosis — its goal is a better conversation with a real clinician.

---

## 3. Input → Output contract

- **Input:** pasted lab report text (CBC, lipid, glucose, thyroid, vitamins, etc.).
- **Processing:** `POST /api/explain-report` → `buildReportPrompt()` → Ollama
  `/api/generate` (`stream:false`, `format:"json"`) → defensive parse + coerce into a
  guaranteed-valid `ReportExplanation`.
- **Output:** one calm answer: overall summary + urgency badge, "what stands out", a
  per-marker breakdown (value · status pill · reference range · plain-English meaning),
  questions for your doctor, general lifestyle context, and a persistent disclaimer.

### Output schema (`lib/types.ts`)

```jsonc
{
  "overallSummary": "string — 2-4 plain-English sentences: what the report covers + big picture",
  "results": [
    {
      "name": "string — e.g. Hemoglobin",
      "value": "string — exactly as written, with unit (never invented)",
      "referenceRange": "string — normal range if given, else \"\"",
      "status": "Low | Normal | High | Borderline | Unknown",
      "meaning": "string — what the marker is + what this value suggests, in plain English"
    }
  ],
  "whatStandsOut": ["string — the few results most worth attention"],
  "questionsForYourDoctor": ["string — specific questions to bring to a clinician"],
  "lifestyleNotes": ["string — general, non-prescriptive context"],
  "urgency": "Routine | Discuss Soon | Seek Care Promptly"
}
```

---

## 4. Product philosophy (do not drift)

- **The answer is the product.** No dashboards, accounts, or history.
- One screen: paste → Explain Report → understand.
- The AI **teaches** (what each marker is and why it matters) and stays conservative:
  it never diagnoses, never invents a number, and always defers to a doctor.

---

## 5. Safety stance

- Persistent "Not medical advice" disclaimer on the answer and in the footer.
- The model is instructed to use only values present in the report, to be calm and
  non-alarming, and to reserve "Seek Care Promptly" for clearly abnormal results.
