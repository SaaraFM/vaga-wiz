/** Orquestra o pipeline de PLN: pré-processamento -> TF-IDF -> cosseno -> nota -> feedback. */

import { preprocess } from "./preprocess";
import { tfidfVectorize, topTerms, type TermWeight } from "./tfidf";
import { cosineSimilarity } from "./similarity";
import {
  buildFeedback,
  classifyScore,
  similarityToScore,
  type Classification,
  type Feedback,
} from "./scoring";

export interface EvaluationResult {
  readonly similarity: number;
  readonly score: number;
  readonly classification: Classification;
  readonly feedback: Feedback;
  readonly cleanedGenerated: string;
  readonly cleanedExpected: string;
  readonly topGeneratedTerms: TermWeight[];
  readonly topExpectedTerms: TermWeight[];
  /** Termos relevantes do gabarito ausentes na descrição gerada. */
  readonly missingTerms: string[];
}

export function evaluateDescription(
  generated: string,
  expected: string,
): EvaluationResult {
  const cleanedGenerated = preprocess(generated);
  const cleanedExpected = preprocess(expected);

  const { vocabulary, vectors } = tfidfVectorize([cleanedGenerated, cleanedExpected], {
    removeStopwords: false,
  });

  const similarity = cosineSimilarity(vectors[0], vectors[1]);
  const score = similarityToScore(similarity);

  const generatedTokens = new Set(cleanedGenerated.split(" ").filter(Boolean));
  const topExpectedTerms = topTerms(vocabulary, vectors[1], 12);

  return {
    similarity,
    score,
    classification: classifyScore(score),
    feedback: buildFeedback(score),
    cleanedGenerated,
    cleanedExpected,
    topGeneratedTerms: topTerms(vocabulary, vectors[0], 8),
    topExpectedTerms: topExpectedTerms.slice(0, 8),
    missingTerms: topExpectedTerms
      .filter((item) => !generatedTokens.has(item.term))
      .map((item) => item.term)
      .slice(0, 8),
  };
}
