/** Gera um relatório em PDF (resumo para o recrutador) com a vaga e a avaliação de PLN. */

import type { EvaluationResult } from "@/lib/nlp";
import { PERGUNTAS, type RespostasVaga } from "./perguntas";

interface DadosRelatorio {
  readonly respostas: RespostasVaga;
  readonly descricao: string;
  readonly avaliacao: EvaluationResult | null;
  readonly nomeGabarito: string;
}

/** Termos do relatório redigidos de forma diferente da tela. */
const ROTULOS_RELATORIO: Record<string, string> = {
  "Baixa qualidade": "Baixa compatibilidade",
  "Não entendeu": "Não atendeu",
};

function rotuloRelatorio(rotulo: string): string {
  return ROTULOS_RELATORIO[rotulo] ?? rotulo;
}

const MARGEM = 18;
const LARGURA_PAGINA = 210;
const ALTURA_PAGINA = 297;
const LARGURA_UTIL = LARGURA_PAGINA - MARGEM * 2;

function nomeArquivo(cargo: string): string {
  const base = cargo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `relatorio-vaga-${base || "sem-titulo"}.pdf`;
}

export async function gerarRelatorioPdf(dados: DadosRelatorio): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGEM;

  const garantirEspaco = (altura: number) => {
    if (y + altura > ALTURA_PAGINA - MARGEM) {
      doc.addPage();
      y = MARGEM;
    }
  };

  const paragrafo = (texto: string, tamanho = 10, estilo: "normal" | "bold" = "normal") => {
    doc.setFont("helvetica", estilo);
    doc.setFontSize(tamanho);
    const linhas = doc.splitTextToSize(texto, LARGURA_UTIL) as string[];
    const alturaLinha = tamanho * 0.45;
    for (const linha of linhas) {
      garantirEspaco(alturaLinha);
      doc.text(linha, MARGEM, y);
      y += alturaLinha;
    }
  };

  const secao = (titulo: string) => {
    y += 4;
    garantirEspaco(10);
    paragrafo(titulo.toUpperCase(), 11, "bold");
    doc.setLineWidth(0.3);
    doc.line(MARGEM, y, LARGURA_PAGINA - MARGEM, y);
    y += 4;
  };

  paragrafo("Relatório da vaga", 18, "bold");
  y += 1;
  paragrafo(
    `${dados.respostas.cargo} · gerado em ${new Date().toLocaleString("pt-BR")}`,
    9,
  );

  secao("Resumo da entrevista");
  for (const pergunta of PERGUNTAS) {
    paragrafo(`${pergunta.rotulo}: ${dados.respostas[pergunta.campo] || "—"}`);
    y += 1;
  }

  if (dados.avaliacao) {
    const a = dados.avaliacao;
    secao("Avaliação de qualidade (PLN)");
    paragrafo(`Gabarito de referência: ${dados.nomeGabarito}`);
    paragrafo(`Similaridade: ${(a.similarity * 100).toFixed(1)}%`);
    paragrafo(`Nota: ${a.score}/100 — ${rotuloRelatorio(a.classification.label)}`, 10, "bold");
    paragrafo(`Feedback: ${rotuloRelatorio(a.feedback.label)} — ${a.feedback.message}`);
    if (a.missingTerms.length > 0) {
      paragrafo(`Termos ausentes: ${a.missingTerms.join(", ")}`);
    }
  }

  secao("Descrição completa da vaga");
  for (const linha of dados.descricao.split("\n")) {
    if (linha.startsWith("# ")) paragrafo(linha.slice(2), 13, "bold");
    else if (linha.startsWith("## ")) {
      y += 2;
      paragrafo(linha.slice(3), 11, "bold");
    } else if (linha.trim() === "") y += 1.5;
    else paragrafo(linha.replace(/^- /, "• "));
  }

  doc.save(nomeArquivo(dados.respostas.cargo));
}
