# LabLens — Lab Report Explainer

**Read your results. Understand your health.**

A private, local-first AI that runs entirely on your laptop. LabLens reads any blood or
lab report, explains every marker in plain English, flags what stands out, and hands you
the questions worth asking your doctor — all without sending a single byte to the cloud.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-black)
![LLM](https://img.shields.io/badge/LLM-Ollama%20(local)-blue)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20local-success)

> Free local AI · No cloud · No accounts · No data leaves your device. Part of the
> **Free AI. Real Problems. Every Sunday.** series.

> ⚕️ **Educational only — not medical advice.** LabLens helps you *read* your report; it
> does not diagnose or treat. Always discuss your results with a qualified clinician.

> Repo layout: the LabLens app lives at the repository root. The `project.md` and
> `design.md` files are the build spec / design system it was generated from, using the
> [Sunday AI template](https://github.com/KrishnaRode/sql-query-explainer).

---

## Table of contents

- [Why LabLens](#why-lablens)
- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [System requirements](#system-requirements)
- [Quick start](#quick-start-one-command)
- [Manual setup](#manual-setup)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [API overview](#api-overview)
- [The sample report](#the-sample-report)
- [Testing](#testing)
- [Extending](#extending)
- [Privacy](#privacy)
- [Safety](#safety)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Author](#author)

---

## Why LabLens

Lab reports arrive as a wall of numbers with cryptic ranges and zero explanation, and the
appointment to ask about them is days away. The obvious shortcut — paste the report into a
cloud AI — means handing sensitive health data to a third party, which most people rightly
won't do.

LabLens fills that gap: it explains the report in warm, plain English **entirely on your
own machine** via a local LLM (Ollama). There are no API bills, no rate limits, and no
privacy trade-offs. It is a *literacy* tool — it teaches you what each marker is and why it
matters so you walk into your appointment informed, never to replace the clinician.

---

## Features

- 🔒 **100% local & private** — runs on free local AI; no cloud, no telemetry, no upload. Your report never leaves your computer.
- 🧪 **Per-marker breakdown** — every result gets its value, a Low / Normal / High / Borderline status, its reference range, and a plain-English explanation of what it measures and what *this* value suggests.
- 🔎 **What stands out** — the few results most worth attention, surfaced in plain language instead of buried in the list.
- 🧭 **Questions for your doctor** — specific, useful questions generated from *your* results, so the appointment is productive.
- 🌱 **General lifestyle context** — non-prescriptive notes (diet, sleep, hydration) — never a treatment plan.
- 🚦 **Calm urgency signal** — a conservative Routine / Discuss Soon / Seek Care Promptly badge; it reflects *how soon to follow up*, not a diagnosis.
- ✋ **Never invents numbers** — the model is instructed to use only values present in the report; results are parsed and coerced into a guaranteed-valid shape before they reach the screen.
- ✨ **Premium single-screen UX** — paste → Explain → understand. ⌘/Ctrl+Enter to submit, one-click Sample, honest loading + error states.

---

## Architecture

```
Next.js UI (:3000)  ──POST /api/explain-report──▶  Next.js API route  ──▶  Ollama (:11434)
                                                         │
                                                         └─ build prompt → /api/generate (strict JSON)
                                                            → extract + coerce → ReportExplanation
```

There is no separate backend and no database — LabLens is a single Next.js app whose one
API route talks to your local Ollama. The flow:

```
paste report ─▶ build strict-JSON prompt ─▶ Ollama (local LLM) ─▶ extract + coerce ─▶ render answer card
```

- **Prompt builder** (`lib/prompts.ts`) — turns the pasted report into a strict instruction: return JSON only, explain like a mentor, never diagnose, never invent a value, stay calm.
- **Ollama client** (`lib/ollama.ts`) — calls `/api/generate` (`stream:false`, `format:"json"`) with a 120s timeout and one retry on transient/parse failures; strips fences, balance-matches the JSON object, then coerces every field into a guaranteed-valid `ReportExplanation` (status/urgency enums, string arrays, dropped-blank markers).
- **API route** (`app/api/explain-report/route.ts`) — validates input (non-empty, under 20k chars), picks the model, and maps known failures (offline, model missing, timeout) to friendly, fixable errors.
- **Answer view** (`components/AnswerView.tsx`) — renders the result as one calm card: summary + urgency badge, what stands out, per-marker breakdown, questions, lifestyle notes, and a persistent disclaimer.

---

## Tech stack

| Layer      | Technology                                                          |
| ---------- | ------------------------------------------------------------------- |
| Frontend   | Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS v4    |
| Backend    | Next.js Route Handler (Node runtime) — no separate server, no DB    |
| Local LLM  | Ollama running `qwen2.5` (swappable, e.g. `llama3.2:3b`)            |
| Storage    | None — stateless; nothing is persisted                              |
| Tooling    | `run.sh` / `run.bat` one-command launcher; npm                      |

---

## System requirements

LabLens runs a real large language model locally, so the main resource cost is RAM and
disk for the model — not a network connection.

### Software

- **Node.js 18.18+** — <https://nodejs.org>
- **Ollama** — <https://ollama.com/download>
- **OS** — macOS, Linux, or Windows (WSL2 recommended on Windows)

### Hardware (driven by the local LLM)

| Resource | Minimum                       | Recommended                              |
| -------- | ----------------------------- | ---------------------------------------- |
| RAM      | 8 GB                          | 16 GB+ (smoother with other apps open)   |
| Disk     | ~5 GB free                    | 10 GB+ (`qwen2.5` ≈ 4.7 GB + deps)       |
| CPU      | Any modern 64-bit multi-core  | Apple Silicon / recent x86               |
| GPU      | Not required (CPU inference)  | Any Ollama-supported GPU = faster        |

**Note on speed:** with `qwen2.5` on a CPU-only machine an explanation typically takes
~10–30s (a little longer on the very first run while the model loads into memory). A GPU
or Apple Silicon reduces this significantly. The UI shows an honest "Reading your report…"
status with rotating progress lines while this happens. Prefer instant demos with zero
download? Use the lighter `llama3.2:3b` (~2 GB) — see [Configuration](#configuration).

---

## Quick start (one command)

```bash
./run.sh          # macOS / Linux
```

```bat
run.bat           :: Windows
```

`run.sh` checks prerequisites, starts Ollama, pulls the model (`qwen2.5` by default),
installs dependencies, launches the dev server, and serves the app at
<http://localhost:3000>.

---

## Manual setup

```bash
# 0) Start Ollama and pull the model (first run only)
ollama serve &
ollama pull qwen2.5

# 1) Install + run
npm install
npm run dev
```

Then open <http://localhost:3000>, paste a report (or click **Sample**), and press
**Explain Report**.

---

## Configuration

LabLens has no `.env` file to manage — branding and the default model live in
`app.config.ts`, and the only runtime knob is the Ollama URL.

| Setting        | Where                         | Default                  | Purpose                                       |
| -------------- | ----------------------------- | ------------------------ | --------------------------------------------- |
| `defaultModel` | `app.config.ts`               | `qwen2.5`                | Ollama model used for every explanation       |
| `OLLAMA_HOST`  | environment variable          | `http://localhost:11434` | Local Ollama URL                              |
| `MODEL`        | environment (read by `run.sh`)| from `app.config.ts`     | One-off model override for the launcher        |
| Request port   | `PORT` env / `npm run dev -- -p` | `3000`                | Dev server port                              |

Swap the model with any installed Ollama model:

```bash
MODEL=llama3.2:3b ./run.sh        # one-off, no edit
# — or — set defaultModel: "llama3.2:3b" in app.config.ts to make it permanent
```

Internal limits (in code): reports are capped at 20,000 characters per pass
(`app/api/explain-report/route.ts`) and the model call times out after 120s with one retry
(`lib/ollama.ts`).

---

## Project structure

```
lablens/
├── app/
│   ├── api/explain-report/route.ts   # the one endpoint: validate → prompt → Ollama → coerce
│   ├── globals.css                   # design tokens (@theme), navy glow, motion
│   ├── layout.tsx                    # metadata from app.config.ts
│   └── page.tsx                      # single screen: input → action → answer
├── components/
│   ├── ReportInput.tsx               # monospace "report window" textarea (⌘/Ctrl+Enter)
│   ├── ExplainButton.tsx             # primary action + Sample + Clear
│   ├── AnswerView.tsx                # the answer card (summary, markers, questions, …)
│   ├── LoadingState.tsx              # rotating status lines + skeleton
│   └── ErrorMessage.tsx              # friendly, fixable errors with retry
├── lib/
│   ├── ollama.ts                     # /api/generate call, timeout/retry, JSON extract + coerce
│   ├── prompts.ts                    # the teach-don't-diagnose prompt builder
│   ├── types.ts                      # ReportExplanation contract + enums
│   └── sample.ts                     # one realistic demo report
├── app.config.ts                     # branding + default model (run scripts read this)
├── project.md / design.md            # build spec + design system
├── run.sh / run.bat                  # one-command launchers
├── LICENSE                           # MIT
└── README.md
```

---

## API overview

LabLens exposes a single endpoint, served by the Next.js app at `http://localhost:3000`.

| Method | Endpoint              | Purpose                                  |
| ------ | --------------------- | ---------------------------------------- |
| POST   | `/api/explain-report` | Explain a pasted lab report (JSON in/out)|

**Request**

```jsonc
{
  "report": "Hemoglobin  10.2 g/dL  (13.0 - 17.0)\n...",  // required, ≤ 20,000 chars
  "model": "qwen2.5"                                       // optional; defaults to app.config.ts
}
```

**Response** (`ReportExplanation` — `lib/types.ts`)

```jsonc
{
  "overallSummary": "string — what the report covers + the big picture",
  "results": [
    {
      "name": "Hemoglobin",
      "value": "10.2 g/dL",
      "referenceRange": "13.0 - 17.0",
      "status": "Low | Normal | High | Borderline | Unknown",
      "meaning": "what the marker is + what this value suggests, in plain English"
    }
  ],
  "whatStandsOut": ["string"],
  "questionsForYourDoctor": ["string"],
  "lifestyleNotes": ["string"],
  "urgency": "Routine | Discuss Soon | Seek Care Promptly"
}
```

**Errors** return `{ "error": "...", "hint": "..." }` with a fitting status — e.g. `503`
(Ollama offline → *"Start it using: ollama serve"*), `404` (model missing → *"ollama pull
qwen2.5"*), `504` (timeout), `400` (empty/oversized input).

---

## The sample report

LabLens ships with one realistic, multi-panel sample (`lib/sample.ts`) — a CBC + lipid +
glucose + thyroid + vitamins report deliberately containing lows (anemia), highs
(cholesterol, sugar), borderlines, and normals — so a one-click **Sample** demo exercises
every status and renders a full, interesting answer.

---

## Testing

With the dev server running, a quick end-to-end smoke check:

```bash
# Ollama reachable?
curl -s http://localhost:11434/api/tags >/dev/null && echo "ollama ok"

# Explain the sample report end-to-end
curl -s -X POST http://localhost:3000/api/explain-report \
  -H 'Content-Type: application/json' \
  -d '{"report":"Hemoglobin 10.2 g/dL (13.0 - 17.0)\nLDL 158 mg/dL (< 100)"}' | head
```

You should get back a JSON `ReportExplanation` with a `results` array. Then open
<http://localhost:3000>, click **Sample**, and confirm the answer renders with status pills
and per-marker explanations.

---

## Extending

- **Different model:** set `defaultModel` in `app.config.ts` (e.g. `qwen2.5`, `llama3.1`, `gemma2`) or `MODEL=… ./run.sh`.
- **Tune the explanation:** edit the prompt in `lib/prompts.ts` — sections, tone, and safety rules all live there.
- **Add output fields:** extend `ReportExplanation` in `lib/types.ts`, coerce them in `lib/ollama.ts`, and render them in `components/AnswerView.tsx`.
- **Restyle:** all design tokens are defined once in `app/globals.css` via Tailwind `@theme` — change the palette there and the whole UI follows.

---

## Privacy

LabLens is local-only: no cloud calls, no telemetry, no external APIs at runtime, and no
storage. Your report is sent only to your own Ollama instance on `localhost`, the result is
rendered, and nothing is persisted anywhere. Close the tab and it's gone.

---

## Safety

LabLens is an educational literacy tool, not a medical device. The model is instructed to
use only values present in the report, to stay calm and non-alarming, to avoid diagnosing,
and to reserve the "Seek Care Promptly" signal for clearly abnormal results. A persistent
**"Not medical advice"** disclaimer appears on every answer and in the footer. Always
confirm your results with a qualified clinician, and seek urgent care for any severe or
worsening symptoms.

---

## Troubleshooting

| Problem                          | Fix                                                                  |
| -------------------------------- | -------------------------------------------------------------------- |
| "Ollama is not running."         | `ollama serve`, then retry                                           |
| "The model is not installed."    | `ollama pull qwen2.5` (or whatever `defaultModel` is)                |
| Explanation is slow              | Normal on CPU-only machines (~10–30s); first run loads the model. Use a smaller model (`llama3.2:3b`) or a GPU |
| Timed out                        | Retry; for very long reports, split them or use a faster model       |
| Port 3000 in use                 | `npm run dev -- -p 3001`                                             |
| Out of memory                    | Close other apps, or use a smaller model (e.g. `llama3.2:1b`)        |

---

## License

Released under the MIT License — see [LICENSE](LICENSE). Copyright © 2026 Krishna Rode.

---

## Author

Developed by **Krishna Rode**. Part of the **Free AI. Real Problems. Every Sunday.** series.
