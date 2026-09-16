/**
 * Testes obrigatórios do pipeline de PLN.
 * Execução: `bun tests/testes-pln.ts`
 *
 * Teste 1 - descrição semelhante ao gabarito  -> alta similaridade
 * Teste 2 - descrição totalmente diferente    -> baixa similaridade
 * Teste 3 - mesmo contexto, palavras distintas -> limitação do TF-IDF
 */

import assert from "node:assert/strict";
import { evaluateDescription, preprocess } from "../src/lib/nlp";
import { GABARITOS } from "../src/lib/vagas/gabaritos";

const gabaritoPython = GABARITOS[0]!.descricao;

interface Caso {
  readonly nome: string;
  readonly gerada: string;
  readonly esperada: string;
  readonly verificar: (score: number) => boolean;
  readonly expectativa: string;
}

const casos: Caso[] = [
  {
    nome: "Teste 1 — descrição semelhante ao modelo",
    gerada: `Estamos buscando um Desenvolvedor Python Júnior para atuar no desenvolvimento de aplicações backend.
Responsabilidades: desenvolver e manter APIs REST, integrar banco de dados relacional, escrever testes automatizados e participar de code review.
Requisitos: Python, lógica de programação, banco de dados SQL e versionamento com Git.
Tecnologias: Python, Django, PostgreSQL, Docker, Git.
Benefícios: vale refeição, plano de saúde e plano de carreira.
Modelo de trabalho: híbrido.`,
    esperada: gabaritoPython,
    verificar: (score) => score >= 71,
    expectativa: "alta similaridade (>= 71)",
  },
  {
    nome: "Teste 2 — descrição diferente do modelo",
    gerada: `Procuramos um Chef de Cozinha para restaurante italiano.
Responsabilidades: criar cardápios, controlar estoque de ingredientes e liderar a brigada de cozinha.
Benefícios: refeição no local e vale transporte.`,
    esperada: gabaritoPython,
    verificar: (score) => score <= 40,
    expectativa: "baixa similaridade (<= 40)",
  },
  {
    nome: "Teste 3 — mesmo contexto, palavras diferentes (limitação do TF-IDF)",
    gerada: `Procuramos pessoa programadora iniciante para construir serviços de servidor.
Vai criar interfaces de integração web, conectar repositórios de informação e validar rotinas com verificações automáticas.
Regime de atuação misto entre escritório e casa.`,
    esperada: gabaritoPython,
    verificar: (score) => score <= 40,
    expectativa: "baixa similaridade mesmo com contexto equivalente (<= 40)",
  },
];

console.log("Pré-processamento de exemplo:");
console.log('  entrada: "Desenvolvedor Python, responsável por criar APIs!"');
console.log(`  saída:   "${preprocess("Desenvolvedor Python, responsável por criar APIs!")}"`);
console.log("");

let falhas = 0;

for (const caso of casos) {
  const resultado = evaluateDescription(caso.gerada, caso.esperada);
  const passou = caso.verificar(resultado.score);
  if (!passou) falhas += 1;

  console.log(`${passou ? "PASSOU" : "FALHOU"} — ${caso.nome}`);
  console.log(`  similaridade : ${(resultado.similarity * 100).toFixed(1)}%`);
  console.log(`  nota         : ${resultado.score}/100 (${resultado.classification.label})`);
  console.log(`  feedback     : ${resultado.feedback.label} — ${resultado.feedback.message}`);
  console.log(`  esperado     : ${caso.expectativa}`);
  console.log("");
}

console.log(
  "Limitação demonstrada no Teste 3: o TF-IDF compara palavras literais, não significado.\n" +
    "Sinônimos como 'programadora' x 'desenvolvedor' ou 'serviços de servidor' x 'backend'\n" +
    "reduzem a nota mesmo quando o contexto é o mesmo.",
);

assert.equal(falhas, 0, `${falhas} teste(s) falharam.`);
console.log("\nTodos os testes passaram.");
