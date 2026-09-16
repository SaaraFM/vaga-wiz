/**
 * Implementação de TF-IDF equivalente ao TfidfVectorizer do scikit-learn
 * (smooth_idf=True, norm="l2", sublinear_tf=False).
 *
 * idf(t) = ln((1 + n) / (1 + df(t))) + 1
 */

import { tokenize, type PreprocessOptions } from "./preprocess";

export interface TfidfResult {
  /** Vocabulário ordenado alfabeticamente (índice = posição no vetor). */
  readonly vocabulary: string[];
  /** Um vetor L2-normalizado por documento. */
  readonly vectors: number[][];
  /** IDF por termo, na mesma ordem do vocabulário. */
  readonly idf: number[];
}

export interface TermWeight {
  readonly term: string;
  readonly weight: number;
}

/** Ajusta e transforma os documentos em vetores TF-IDF. */
export function tfidfVectorize(
  documents: readonly string[],
  options: PreprocessOptions = {},
): TfidfResult {
  const tokenizedDocs = documents.map((doc) => tokenize(doc, options));

  const vocabulary = Array.from(new Set(tokenizedDocs.flat())).sort((a, b) => a.localeCompare(b));
  const termIndex = new Map(vocabulary.map((term, index) => [term, index]));

  const n = documents.length;
  const documentFrequency = new Array<number>(vocabulary.length).fill(0);

  for (const tokens of tokenizedDocs) {
    for (const term of new Set(tokens)) {
      const index = termIndex.get(term);
      if (index !== undefined) documentFrequency[index] = (documentFrequency[index] ?? 0) + 1;
    }
  }

  const idf = documentFrequency.map((df) => Math.log((1 + n) / (1 + df)) + 1);

  const vectors = tokenizedDocs.map((tokens) => {
    const vector = new Array<number>(vocabulary.length).fill(0);
    for (const term of tokens) {
      const index = termIndex.get(term);
      if (index !== undefined) vector[index] = (vector[index] ?? 0) + 1;
    }
    for (let i = 0; i < vector.length; i += 1) vector[i] = (vector[i] ?? 0) * (idf[i] ?? 0);
    return l2Normalize(vector);
  });

  return { vocabulary, vectors, idf };
}

/** Normalização L2 de um vetor. */
export function l2Normalize(vector: readonly number[]): number[] {
  const norm = Math.sqrt(vector.reduce((acc, value) => acc + value * value, 0));
  if (norm === 0) return [...vector];
  return vector.map((value) => value / norm);
}

/** Termos mais relevantes de um vetor TF-IDF. */
export function topTerms(
  vocabulary: readonly string[],
  vector: readonly number[],
  limit = 8,
): TermWeight[] {
  return vector
    .map((weight, index) => ({ term: vocabulary[index] ?? "", weight }))
    .filter((item) => item.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}
