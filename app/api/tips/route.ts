import { NextResponse } from "next/server";
import { appConfig } from "@/app.config";
import { getFallbackTips } from "@/lib/fallbackTips";
import { getLanguage } from "@/lib/languages";
import { generateTips, resolveModel } from "@/lib/ollama";
import { buildTipsPrompt } from "@/lib/prompts";

const MIN_TIPS = 6;

/** Tops up a thin batch from the language's curated pool (deduped). */
function topUp(tips: string[], code: string): string[] {
  if (tips.length >= MIN_TIPS) return tips;
  const seen = new Set(tips.map((t) => t.toLowerCase()));
  const pool = [...getFallbackTips(code)].sort(() => Math.random() - 0.5);
  for (const tip of pool) {
    if (tips.length >= 10) break;
    if (!seen.has(tip.toLowerCase())) {
      tips.push(tip);
      seen.add(tip.toLowerCase());
    }
  }
  return tips;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TipsRequest {
  language?: string;
  model?: string;
}

/**
 * Generates a fresh batch of wellness tips in the chosen language for the
 * "while you wait" carousel. Non-critical: on any failure we return an empty
 * list with 200 so the client simply falls back to its status lines.
 */
export async function POST(req: Request) {
  let body: TipsRequest;
  try {
    body = (await req.json()) as TipsRequest;
  } catch {
    body = {};
  }

  const language = getLanguage(body.language);
  const requested =
    typeof body.model === "string" && body.model.trim().length > 0
      ? body.model.trim()
      : appConfig.defaultModel;

  try {
    const model = await resolveModel(requested);
    const tips = topUp(await generateTips(buildTipsPrompt(language), model), language.code);
    return NextResponse.json({ tips, language: language.code });
  } catch {
    // Total failure: still return the curated localized pool so tips show.
    return NextResponse.json({ tips: topUp([], language.code), language: language.code });
  }
}
