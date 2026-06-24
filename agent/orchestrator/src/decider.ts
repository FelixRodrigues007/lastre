import type { Decider, Decision, DecisionContext } from "./types.js";

/** Decider determinístico usado nos testes e como fallback seguro do LLM. */
export class RuleDecider implements Decider {
  async decide(context: DecisionContext): Promise<Decision> {
    const { artifact, alreadyAttested, limits } = context;

    if (alreadyAttested) {
      return {
        action: "skip",
        reasoning: "O assetId já foi atestado antes; pular evita pagar e registrar a mesma verificação novamente.",
        decidedBy: "rule",
      };
    }

    const missingField = findMissingRequiredField(artifact);
    if (missingField) {
      return {
        action: "escalate",
        reasoning: `Campo obrigatório vazio ou inválido (${missingField}); o lote precisa de revisão humana antes de qualquer pagamento.`,
        decidedBy: "rule",
      };
    }

    const { lat, lng } = artifact.origin;
    const { minLat, maxLat, minLng, maxLng } = limits.minePerimeter;
    if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) {
      return {
        action: "escalate",
        reasoning: "Geolocalização fora do perímetro conhecido da mina; escalar para humano antes de verificar.",
        decidedBy: "rule",
      };
    }

    const { minExclusive, maxInclusive } = limits.massGrams;
    if (artifact.massGrams <= minExclusive || artifact.massGrams > maxInclusive) {
      return {
        action: "escalate",
        reasoning: "Massa fora da faixa plausível do lote; escalar para humano antes de pagar pela verificação.",
        decidedBy: "rule",
      };
    }

    return {
      action: "pay",
      reasoning: "Metadados básicos estão completos, dentro do perímetro e em faixa de massa plausível; pagar para verificar o selo determinístico.",
      decidedBy: "rule",
    };
  }
}

type LlmDeciderOptions = {
  apiKey?: string;
  model?: string;
  fallback?: RuleDecider;
};

/**
 * Decider via OpenRouter para o demo.
 *
 * Importante: ele só decide a AÇÃO operacional. O veredito Valid/Invalid nunca
 * vem daqui; depois da decisão, o LocalGateway recomputa o selo SHA-256.
 */
export class LlmDecider implements Decider {
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly fallback: RuleDecider;

  constructor(options: LlmDeciderOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.OPENROUTER_API_KEY;
    this.model = options.model ?? process.env.OPENROUTER_MODEL ?? "openrouter/auto";
    this.fallback = options.fallback ?? new RuleDecider();
  }

  async decide(context: DecisionContext): Promise<Decision> {
    if (!this.apiKey) {
      return this.fallback.decide(context);
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
                "Você é o decider operacional do Lastro.",
                "Você escolhe somente uma ação: pay, skip ou escalate.",
                "Você NUNCA decide se o lote é Valid ou Invalid.",
                "O veredito de validade será decidido depois por um selo SHA-256 determinístico.",
                "Responda somente JSON estrito no formato {\"action\":\"pay|skip|escalate\",\"reasoning\":\"...\"}.",
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
        return this.fallback.decide(context);
      }

      const body = (await response.json()) as OpenRouterResponse;
      const content = body.choices?.[0]?.message?.content;
      const parsed = parseDecisionContent(content);

      if (!parsed) {
        return this.fallback.decide(context);
      }

      return {
        ...parsed,
        decidedBy: "llm",
      };
    } catch {
      return this.fallback.decide(context);
    }
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
