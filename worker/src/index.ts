interface Env {
  GEMINI_API_KEY: string;
  ALLOWED_ORIGINS: string;
}

interface GeminiResult {
  score: number;
  verdict: "entendeu" | "parcial" | "nao_entendeu";
  feedback: string;
}

const MAX_TEXT_LENGTH = 12_000;

function json(data: unknown, status: number, origin: string | null, allowed: boolean): Response {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "vary": "Origin",
  });
  if (origin && allowed) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-methods", "POST, OPTIONS");
    headers.set("access-control-allow-headers", "content-type");
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function isGeminiResult(value: unknown): value is GeminiResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<GeminiResult>;
  return (
    typeof result.score === "number" &&
    Number.isFinite(result.score) &&
    result.score >= 0 &&
    result.score <= 100 &&
    ["entendeu", "parcial", "nao_entendeu"].includes(result.verdict ?? "") &&
    typeof result.feedback === "string" &&
    result.feedback.length > 0 &&
    result.feedback.length <= 1_200
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("origin");
    const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((item) => item.trim());
    const allowed = Boolean(origin && allowedOrigins.includes(origin));

    if (request.method === "OPTIONS") {
      return allowed
        ? new Response(null, {
            status: 204,
            headers: {
              "access-control-allow-origin": origin!,
              "access-control-allow-methods": "POST, OPTIONS",
              "access-control-allow-headers": "content-type",
              "access-control-max-age": "86400",
              vary: "Origin",
            },
          })
        : json({ error: "Origem não permitida." }, 403, origin, false);
    }

    if (!allowed) return json({ error: "Origem não permitida." }, 403, origin, false);
    if (request.method !== "POST") return json({ error: "Método não permitido." }, 405, origin, true);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Envie um corpo JSON válido." }, 400, origin, true);
    }

    if (!body || typeof body !== "object") {
      return json({ error: "Envie os campos generated e expected." }, 400, origin, true);
    }
    const input = body as { generated?: unknown; expected?: unknown };
    if (
      typeof input.generated !== "string" ||
      typeof input.expected !== "string" ||
      !input.generated.trim() ||
      !input.expected.trim() ||
      input.generated.length > MAX_TEXT_LENGTH ||
      input.expected.length > MAX_TEXT_LENGTH
    ) {
      return json({ error: "Informe os dois textos (até 12 mil caracteres cada)." }, 400, origin, true);
    }

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: "Você avalia uma descrição de vaga comparando-a com uma referência. Julgue cobertura e equivalência semântica: aceite sinônimos e paráfrases; não exija palavras idênticas. Não dê pontos por conteúdo irrelevante. Retorne apenas JSON válido com score (inteiro de 0 a 100), verdict (entendeu, parcial ou nao_entendeu) e feedback (explicação breve em português). Use entendeu para 81-100, parcial para 50-80 e nao_entendeu para 0-49.",
              }],
            },
            contents: [{
              role: "user",
              parts: [{ text: `REFERÊNCIA:\n${input.expected}\n\nDESCRIÇÃO A AVALIAR:\n${input.generated}` }],
            }],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  score: { type: "INTEGER" },
                  verdict: { type: "STRING", enum: ["entendeu", "parcial", "nao_entendeu"] },
                  feedback: { type: "STRING" },
                },
                required: ["score", "verdict", "feedback"],
              },
              maxOutputTokens: 350,
            },
          }),
        },
      );

      if (!response.ok) {
        const status = response.status === 429 ? 429 : 502;
        return json(
          { error: status === 429 ? "Limite de uso do Gemini atingido. Tente mais tarde." : "O Gemini não conseguiu avaliar agora. Confira a chave e tente novamente." },
          status,
          origin,
          true,
        );
      }

      const payload = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = payload.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
      if (!text) throw new Error("Gemini returned no content");
      const result: unknown = JSON.parse(text);
      if (!isGeminiResult(result)) throw new Error("Gemini returned invalid evaluation");
      return json(result, 200, origin, true);
    } catch {
      return json({ error: "Falha ao consultar o Gemini. Verifique a chave e tente novamente." }, 502, origin, true);
    }
  },
};
