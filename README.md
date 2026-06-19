# LabLens — Lab Report Explainer: Key Overview

**Core Value Proposition**

LabLens turns the wall of numbers on a blood or lab report into plain English. The system reads each marker, compares it to its reference range, and explains what it measures and what the value suggests — then surfaces what stands out and the questions worth taking to a doctor. As the philosophy goes: *the answer is the product* — it teaches you to read *your* report, it does not diagnose. Educational only, never medical advice.

**Privacy-First Architecture**

The application runs entirely on your device using Ollama (a local LLM framework). No data transmission occurs—your health data never leaves your computer. This eliminates API costs, rate limits, and the privacy concerns inherent in pasting medical reports into cloud-based AI tools.

**Technical Foundation**

The system employs:
- Next.js 15 (App Router) frontend on port 3000
- A single Next.js API route (`/api/explain-report`) — no separate backend, no database
- Ollama running locally on port 11434
- Defensive JSON parsing + coercion into a guaranteed-valid result shape

**Key Features**

The platform includes a per-marker breakdown (value, Low/Normal/High/Borderline status, reference range, and a plain-English meaning), a "what stands out" summary, suggested questions for your doctor, general lifestyle context, and a calm, conservative urgency signal. A one-click Sample report makes the demo shine, and a persistent "Not medical advice" disclaimer keeps the tool honest. The model is instructed to use only values present in the report — it never invents a number.

**System Requirements**

Minimum specifications include Node.js 18.18+ and Ollama. The default model (`qwen2.5`) consumes approximately 4.7GB disk space; a lighter option such as `llama3.2:3b` (~2GB) also works. Explanations typically generate in 10–30 seconds on CPU-only systems, slightly longer on the first run while the model loads into memory.

**Getting Started**

Running `./run.sh` from the lablens directory automates setup—it checks Node and Ollama, starts Ollama, pulls the model, installs dependencies, and launches the app at http://localhost:3000. On Windows, run `run.bat`. To use a different model, change `defaultModel` in `app.config.ts` or run `MODEL=llama3.2:3b ./run.sh`.
