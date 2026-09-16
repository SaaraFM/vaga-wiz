/** Similaridade do cosseno entre vetores TF-IDF. */

export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length) {
    throw new Error("Os vetores precisam ter a mesma dimensão.");
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    const valueA = a[i] ?? 0;
    const valueB = b[i] ?? 0;
    dot += valueA * valueB;
    normA += valueA * valueA;
    normB += valueB * valueB;
  }

  if (normA === 0 || normB === 0) return 0;

  const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.min(1, Math.max(0, similarity));
}
