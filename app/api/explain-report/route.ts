import { NextResponse } from "next/server";
import { appConfig } from "@/app.config";
import { getLanguage } from "@/lib/languages";
import { generateExplanation, OllamaError, resolveModel } from "@/lib/ollama";
import { buildReportPrompt } from "@/lib/prompts";
import type { ApiError, ExplainRequest, ReportExplanation } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REPORT_CHARS = 20_000;

export async function POST(req: Request) {
  let body: ExplainRequest;
  try {
    body = (await req.json()) as ExplainRequest;
  } catch {
    return err("The request body was not valid JSON.", 400);
  }

  const report = typeof body.report === "string" ? body.report.trim() : "";
  if (!report) {
    return err("Please paste a lab report first.", 400, "The report text was empty.");
  }
  if (report.length > MAX_REPORT_CHARS) {
    return err(
      "That report is a bit long for a single pass.",
      400,
      `Keep it under ${MAX_REPORT_CHARS.toLocaleString()} characters, or split it into sections.`
    );
  }

  const requested =
    typeof body.model === "string" && body.model.trim().length > 0
      ? body.model.trim()
      : appConfig.defaultModel;

  // Treat the request as a *preference*: use it if installed, else fall back to
  // whatever model the user already has — no surprise downloads.
  const model = await resolveModel(requested);
  const language = getLanguage(body.language);

  try {
    const explanation: ReportExplanation = await generateExplanation(
      buildReportPrompt(report, language),
      model
    );
    return NextResponse.json({
      ...explanation,
      modelUsed: model,
      language: language.code,
    });
  } catch (e) {
    if (e instanceof OllamaError) {
      return err(e.message, e.status, e.hint);
    }
    return err("Something went wrong while generating the explanation.", 500);
  }
}

function err(error: string, status: number, hint?: string) {
  const payload: ApiError = hint ? { error, hint } : { error };
  return NextResponse.json(payload, { status });
}
