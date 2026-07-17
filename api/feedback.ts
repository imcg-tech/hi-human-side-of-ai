import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";

/**
 * AI coaching for a solo practice attempt.
 *
 * Stateless and privacy-first: the user's wording is used only to generate the
 * tip in this single request and is never stored or logged. The endpoint is
 * additive, the games stay fully usable (local self-check) when it is not
 * configured. Set ANTHROPIC_API_KEY in the Vercel project to enable it.
 */

type Kind = "feedback" | "oneclearask";

const MAX_TEXT = 1200; // a practice attempt, not an essay

// What "good" looks like per game, so the coach grades against the right rubric.
const RUBRIC: Record<Kind, string> = {
  feedback: [
    "The user is practising giving feedback to a colleague using the SBI model:",
    "· Situation, name the concrete moment (when / where), not a vague generalisation.",
    "· Behavior, describe the observable action, not a character judgement or label.",
    "· Impact, say the effect it had (on the work, the team, or you), using I-language.",
    "Good feedback is specific, kind, and actionable, and separates observation from interpretation.",
  ].join("\n"),
  oneclearask: [
    "The user is practising making one clear request to a colleague. A strong ask has:",
    "· Recipient, it is clear who is being asked.",
    "· What, the concrete deliverable or action, unambiguous.",
    "· When, a specific deadline or timing.",
    "· Why (optional but motivating), the reason it matters.",
    "A good ask is short, direct, warm, and leaves no room for guessing.",
  ].join("\n"),
};

const SCHEMA = {
  type: "object" as const,
  properties: {
    warmth: { type: "string" as const, description: "One specific, genuine sentence on what already works in their wording. Not generic praise." },
    sharpen: { type: "string" as const, description: "The single most useful improvement, phrased as friendly coaching, one or two sentences." },
    rewrite: { type: "string" as const, description: "A concrete rewritten version they could actually send, in their voice. One short message." },
  },
  required: ["warmth", "sharpen", "rewrite"],
  additionalProperties: false,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") { res.status(405).json({ error: "method_not_allowed" }); return; }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(503).json({ error: "not_configured" }); return; }

  const body = (typeof req.body === "string" ? safeParse(req.body) : req.body) ?? {};
  const kind = body.kind as Kind;
  const scenario = typeof body.scenario === "string" ? body.scenario.slice(0, 600) : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (kind !== "feedback" && kind !== "oneclearask") { res.status(400).json({ error: "bad_kind" }); return; }
  if (!text) { res.status(400).json({ error: "empty" }); return; }
  if (text.length > MAX_TEXT) { res.status(400).json({ error: "too_long" }); return; }

  const client = new Anthropic({ apiKey: key });

  const system = [
    "You are a warm, encouraging communication coach inside a team-wellbeing app.",
    "A colleague is practising in private and wants a quick, honest tip on their attempt.",
    RUBRIC[kind],
    "",
    "Rules:",
    "· Be genuinely encouraging first, then give exactly one thing to sharpen. Never pile on.",
    "· Be concrete and specific to THEIR wording, never generic.",
    "· Keep it short. This is a two-minute practice, not a lecture.",
    "· Warm, plain language. No jargon, no emojis, no em-dashes.",
    "· The rewrite must sound like something a real person would send, in their voice.",
  ].join("\n");

  const userMsg = [
    scenario ? `The situation they are responding to:\n${scenario}\n` : "",
    `Their attempt:\n"""${text}"""`,
  ].join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 700,
      system,
      messages: [{ role: "user", content: userMsg }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });

    const block = response.content.find((b) => b.type === "text");
    const raw = block && block.type === "text" ? block.text : "";
    const parsed = safeParse(raw);
    if (!parsed || typeof parsed.rewrite !== "string") { res.status(502).json({ error: "coach_unavailable" }); return; }

    // No-store: the tip is disposable, never cached or persisted.
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ warmth: parsed.warmth, sharpen: parsed.sharpen, rewrite: parsed.rewrite });
  } catch {
    res.status(502).json({ error: "coach_unavailable" });
  }
}

function safeParse(s: string): any {
  try { return JSON.parse(s); } catch { return null; }
}
