import type { Decider, Decision, DecisionContext } from "./types.js";

const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_OPENROUTER_MODEL = "openrouter/auto";

type LlmLogger = (message: string) => void;

/** Deterministic decider used in tests and as the safe LLM fallback. */
export class RuleDecider implements Decider {
  async decide(context: DecisionContext): Promise<Decision> {
    const { artifact, alreadyAttested, limits } = context;

    if (alreadyAttested) {
      return {
        action: "skip",
        reasoning: "The assetId was already attested; skipping avoids paying for and recording the same verification twice.",
        decidedBy: "rule",
      };
    }

    const missingField = findMissingRequiredField(artifact);
    if (missingField) {
      return {
        action: "escalate",
        reasoning: `Required field is empty or invalid (${missingField}); the lot needs human review before any payment.`,
        decidedBy: "rule",
      };
    }

    const { lat, lng } = artifact.origin;
    const { minLat, maxLat, minLng, maxLng } = limits.minePerimeter;
    if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) {
      return {
        action: "escalate",
        reasoning: "Geolocation is outside the known mine perimeter; escalate to a human before verification.",
        decidedBy: "rule",
      };
    }

    const { minExclusive, maxInclusive } = limits.massGrams;
    if (artifact.massGrams <= minExclusive || artifact.massGrams > maxInclusive) {
      return {
        action: "escalate",
        reasoning: "Mass is outside the plausible range for the lot; escalate to a human before paying for verification.",
        decidedBy: "rule",
      };
    }

    return {
      action: "pay",
      reasoning: "Basic metadata is complete, within the perimeter, and in a plausible mass range; pay to verify the deterministic seal.",
      decidedBy: "rule",
    };
  }
}

export type LlmDeciderOptions = {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  fallback?: RuleDecider;
  logger?: LlmLogger;
};

/**
 * OpenRouter-backed decider for operational actions.
 *
 * Critical invariant: the LLM decides only the operational ACTION
 * (`pay`, `skip`, or `escalate`). It never decides, changes, or overwrites the
 * provenance VERDICT (`Valid` / `Invalid`). The verdict is produced later by
 * recomputing the deterministic SHA-256 seal and comparing it with the
 * reference seal.
 */
export class LlmDecider implements Decider {
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly chatCompletionsUrl: string;
  private readonly fallback: RuleDecider;
  private readonly logger: LlmLogger;

  constructor(options: LlmDeciderOptions = {}) {
    this.apiKey = options.apiKey?.trim() ?? process.env.OPENROUTER_API_KEY?.trim();
    this.model = firstNonEmpty(options.model, process.env.OPENROUTER_MODEL) ?? DEFAULT_OPENROUTER_MODEL;
    this.baseUrl = firstNonEmpty(options.baseUrl, process.env.OPENROUTER_BASE_URL) ?? DEFAULT_OPENROUTER_BASE_URL;
    this.chatCompletionsUrl = buildChatCompletionsUrl(this.baseUrl);
    this.fallback = options.fallback ?? new RuleDecider();
    this.logger = options.logger ?? ((message) => console.info(message));

    if (this.apiKey) {
      this.logger(
        `[Lastro] LlmDecider active: OpenRouter LLM path (model=${this.model}, endpoint=${this.chatCompletionsUrl}). ` +
          "The LLM decides ACTION only; the deterministic SHA-256 seal decides VERDICT.",
      );
    } else {
      this.logger(
        "[Lastro] LlmDecider active: rule fallback because OPENROUTER_API_KEY is absent. " +
          "The fallback/LLM decides ACTION only; the deterministic SHA-256 seal decides VERDICT.",
      );
    }
  }

  async decide(context: DecisionContext): Promise<Decision> {
    if (!this.apiKey) {
      return this.fallback.decide(context);
    }

    try {
      const response = await fetch(this.chatCompletionsUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: [
                "You are Lastro's operational decider.",
                "Choose only one action: pay, skip, or escalate.",
                "You NEVER decide whether a lot is Valid or Invalid.",
                "You NEVER overwrite a verdict.",
                "The Valid/Invalid verdict is decided later only by the deterministic SHA-256 seal comparison.",
                "Return strict JSON only: {\"action\":\"pay|skip|escalate\",\"reasoning\":\"...\"}.",
              ].join(" "),
            },
            {
              role: "user",
              content: JSON.stringify(context),
            },
          ],
        }),
      });

      if (!response.ok) {
        return this.decideWithRuleFallback(context, `OpenRouter returned HTTP ${response.status}`);
      }

      const body = (await response.json()) as OpenRouterResponse;
      const content = body.choices?.[0]?.message?.content;
      const parsed = parseDecisionContent(content);

      if (!parsed) {
        return this.decideWithRuleFallback(context, "OpenRouter response did not contain a valid action JSON object");
      }

      return {
        ...parsed,
        decidedBy: "llm",
      };
    } catch (error) {
      return this.decideWithRuleFallback(
        context,
        `OpenRouter request failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  private async decideWithRuleFallback(context: DecisionContext, reason: string): Promise<Decision> {
    this.logger(`[Lastro] LlmDecider using rule fallback: ${reason}.`);
    return this.fallback.decide(context);
  }
}

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function parseDecisionContent(content: string | undefined): Omit<Decision, "decidedBy"> | null {
  if (!content) {
    return null;
  }

  const cleaned = stripJsonFence(content.trim());

  try {
    const parsed = JSON.parse(cleaned) as Partial<Omit<Decision, "decidedBy">>;
    const action = parsed.action;
    const reasoning = parsed.reasoning;

    if ((action === "pay" || action === "skip" || action === "escalate") && typeof reasoning === "string" && reasoning.trim()) {
      return { action, reasoning };
    }
  } catch {
    return null;
  }

  return null;
}

function stripJsonFence(value: string): string {
  if (!value.startsWith("```")) {
    return value;
  }

  return value
    .replace(/^```json\s*/u, "")
    .replace(/^```\s*/u, "")
    .replace(/\s*```$/u, "")
    .trim();
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return undefined;
}

function buildChatCompletionsUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/u, "");

  if (trimmed.endsWith("/chat/completions")) {
    return trimmed;
  }

  return `${trimmed}/chat/completions`;
}

function findMissingRequiredField(artifact: DecisionContext["artifact"]): string | null {
  if (!isNonEmptyString(artifact.assetId)) return "assetId";
  if (!artifact.origin || !Number.isFinite(artifact.origin.lat)) return "origin.lat";
  if (!artifact.origin || !Number.isFinite(artifact.origin.lng)) return "origin.lng";
  if (!isNonEmptyString(artifact.origin.site)) return "origin.site";
  if (!isNonEmptyString(artifact.frameHash)) return "frameHash";
  if (!Number.isFinite(artifact.massGrams)) return "massGrams";
  if (!isNonEmptyString(artifact.capturedAtISO)) return "capturedAtISO";
  if (!isNonEmptyString(artifact.operator)) return "operator";
  return null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
