/**
 * Pré-processamento de texto em português para o pipeline de PLN.
 * Etapas: minúsculas -> remoção de acentos/pontuação/caracteres especiais ->
 * remoção de stopwords -> normalização de espaços.
 */

export const STOPWORDS_PT: ReadonlySet<string> = new Set([
  "a",
  "ao",
  "aos",
  "aquela",
  "aquelas",
  "aquele",
  "aqueles",
  "aquilo",
  "as",
  "ate",
  "com",
  "como",
  "da",
  "das",
  "de",
  "dela",
  "delas",
  "dele",
  "deles",
  "depois",
  "do",
  "dos",
  "e",
  "ela",
  "elas",
  "ele",
  "eles",
  "em",
  "entre",
  "era",
  "eram",
  "essa",
  "essas",
  "esse",
  "esses",
  "esta",
  "estamos",
  "estao",
  "estas",
  "este",
  "esteja",
  "estes",
  "estou",
  "eu",
  "foi",
  "fomos",
  "for",
  "foram",
  "fosse",
  "ha",
  "isso",
  "isto",
  "ja",
  "la",
  "lhe",
  "lhes",
  "mais",
  "mas",
  "me",
  "mesmo",
  "meu",
  "meus",
  "minha",
  "minhas",
  "muito",
  "na",
  "nao",
  "nas",
  "nem",
  "no",
  "nos",
  "nossa",
  "nossas",
  "nosso",
  "nossos",
  "num",
  "numa",
  "o",
  "os",
  "ou",
  "para",
  "pela",
  "pelas",
  "pelo",
  "pelos",
  "por",
  "qual",
  "quando",
  "que",
  "quem",
  "sao",
  "se",
  "seja",
  "sem",
  "ser",
  "seu",
  "seus",
  "so",
  "sobre",
  "sua",
  "suas",
  "tambem",
  "te",
  "tem",
  "tenha",
  "ter",
  "teu",
  "teus",
  "tua",
  "tuas",
  "um",
  "uma",
  "umas",
  "uns",
  "voce",
  "voces",
  "vos",
  "aos",
  "the",
  "and",
  "of",
  "for",
  "with",
  "to",
  "in",
  "on",
]);

/** Remove acentuação mantendo os caracteres base. */
export function removeAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export interface PreprocessOptions {
  /** Remove stopwords em português. Padrão: true. */
  readonly removeStopwords?: boolean;
  /** Tamanho mínimo do token mantido. Padrão: 2. */
  readonly minTokenLength?: number;
}

/** Retorna o texto limpo (tokens separados por espaço simples). */
export function preprocess(text: string, options: PreprocessOptions = {}): string {
  return tokenize(text, options).join(" ");
}

/** Retorna a lista de tokens limpos do texto. */
export function tokenize(text: string, options: PreprocessOptions = {}): string[] {
  const { removeStopwords = true, minTokenLength = 2 } = options;

  const cleaned = removeAccents(text.toLowerCase())
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length === 0) return [];

  return cleaned
    .split(" ")
    .filter((token) => token.length >= minTokenLength)
    .filter((token) => (removeStopwords ? !STOPWORDS_PT.has(token) : true));
}
