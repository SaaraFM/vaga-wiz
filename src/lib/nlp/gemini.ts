export interface GeminiEvaluation {
  readonly score: number;
  readonly verdict: "entendeu" | "parcial" | "nao_entendeu";
  readonly feedback: string;
  readonly revisedDescription: string;
}

/** Chama o Worker, valida a resposta e devolve nota, feedback e descrição revisada. */
export async function evaluateWithGemini(
  generated: string,
  expected: string,
): Promise<GeminiEvaluation> {
  // O navegador chama o Worker pela URL pública; a chave Gemini permanece no servidor.
  const endpoint = import.meta.env["GEMINI_API_URL"]?.trim();
  if (!endpoint) throw new Error("A integração com Gemini ainda não foi configurada.");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ generated, expected }),
  });
  const payload = (await response.json()) as GeminiEvaluation | { error?: string };
  if (!response.ok) {
    throw new Error("error" in payload && payload.error ? payload.error : "Não foi possível avaliar com Gemini.");
  }
  if (
    !("score" in payload) ||
    typeof payload.score !== "number" ||
    typeof payload.feedback !== "string" ||
    typeof payload.revisedDescription !== "string" ||
    !payload.revisedDescription.trim() ||
    !["entendeu", "parcial", "nao_entendeu"].includes(payload.verdict)
  ) {
    throw new Error("O Gemini retornou uma avaliação inválida.");
  }
  return payload;
}
