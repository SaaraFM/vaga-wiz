/** Conversão de similaridade em nota (0-100), classificação e feedback. */

export type QualityLevel = "baixa" | "intermediaria" | "boa" | "excelente";
export type FeedbackLevel = "entendeu" | "parcial" | "nao-entendeu";

export interface Classification {
  readonly level: QualityLevel;
  readonly label: string;
}

export interface Feedback {
  readonly level: FeedbackLevel;
  readonly label: string;
  readonly message: string;
}

/** nota = similaridade * 100 */
export function similarityToScore(similarity: number): number {
  return Math.round(similarity * 100);
}

export function classifyScore(score: number): Classification {
  if (score <= 40) return { level: "baixa", label: "Baixa qualidade" };
  if (score <= 70) return { level: "intermediaria", label: "Qualidade intermediária" };
  if (score <= 90) return { level: "boa", label: "Boa descrição" };
  return { level: "excelente", label: "Excelente descrição" };
}

export function buildFeedback(score: number): Feedback {
  if (score > 80) {
    return {
      level: "entendeu",
      label: "Entendeu",
      message:
        "A descrição possui grande similaridade com o modelo esperado.",
    };
  }
  if (score >= 50) {
    return {
      level: "parcial",
      label: "Parcial",
      message:
        "A descrição possui alguns elementos importantes, mas pode ser melhorada.",
    };
  }
  return {
    level: "nao-entendeu",
    label: "Não entendeu",
    message: "A descrição possui pouca relação com o modelo esperado.",
  };
}
