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

/** Converte a similaridade de 0–1 em uma nota inteira de 0–100. */
export function similarityToScore(similarity: number): number {
  return Math.round(similarity * 100);
}

/** Classifica a nota em uma das faixas de aderência definidas pelo projeto. */
export function classifyScore(score: number): Classification {
  // Converte a porcentagem em faixas de qualidade mais fáceis de apresentar.
  if (score <= 40) return { level: "baixa", label: "Baixa aderência" };
  if (score <= 70) return { level: "intermediaria", label: "Aderência intermediária" };
  if (score <= 90) return { level: "boa", label: "Boa aderência" };
  return { level: "excelente", label: "Excelente aderência" };
}

/** Cria um rótulo e uma mensagem de feedback coerentes com a faixa da nota. */
export function buildFeedback(score: number): Feedback {
  // O texto descreve aderência ao gabarito; não prova que o sistema compreendeu a semântica.
  if (score > 80) {
    return {
      level: "entendeu",
      label: "Alta aderência",
      message: "A descrição possui alta aderência textual ao gabarito selecionado.",
    };
  }
  if (score >= 50) {
    return {
      level: "parcial",
      label: "Aderência parcial",
      message:
        "A descrição possui alguns elementos do gabarito, mas pode ser aproximada da referência.",
    };
  }
  return {
    level: "nao-entendeu",
    label: "Baixa aderência",
    message: "A descrição possui pouca relação textual com o gabarito selecionado.",
  };
}
