/**
 * Monta e baixa o relatório final da vaga em PDF.
 * Inclui respostas da entrevista, avaliação local, correção do Gemini quando
 * disponível e a descrição final em formato simples, próprio para impressão.
 */

import type { EvaluationResult } from "@/lib/nlp";
import type { GeminiEvaluation } from "@/lib/nlp/gemini";
import { PERGUNTAS, type RespostasVaga } from "./perguntas";

interface DadosRelatorio {
  readonly respostas: RespostasVaga;
  readonly descricao: string;
  readonly avaliacao: EvaluationResult | null;
  readonly nomeGabarito: string;
  readonly avaliacaoGemini?: GeminiEvaluation | null;
}

const SECOES_DESCRICAO = new Set([
  "Resumo da oportunidade",
  "Responsabilidades",
  "Requisitos",
  "Tecnologias",
  "Benefícios",
  "Modelo de trabalho",
]);

const MARGEM = 18;
const LARGURA_PAGINA = 210;
const ALTURA_PAGINA = 297;
const LARGURA_UTIL = LARGURA_PAGINA - MARGEM * 2;
const LIMITE_CONTEUDO = ALTURA_PAGINA - MARGEM;

function nomeArquivo(cargo: string): string {
  const base = cargo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `relatorio-vaga-${base || "sem-titulo"}.pdf`;
}

function rotuloVeredito(veredito: GeminiEvaluation["verdict"]): string {
  if (veredito === "entendeu") return "Entendeu";
  if (veredito === "parcial") return "Parcial";
  return "Não entendeu";
}

/** Cria as páginas e organiza texto, títulos, cartões e rodapés do relatório. */
export async function gerarRelatorioPdf(dados: DadosRelatorio): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Cabeçalho compacto com cargo e data, seguindo o modelo enviado.
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Relatório da vaga", MARGEM, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const linhasCargo = doc.splitTextToSize(
    `${dados.respostas.cargo.trim() || "Cargo não informado"} - gerado em ${new Date().toLocaleString("pt-BR")}`,
    LARGURA_UTIL,
  ) as string[];
  doc.text(linhasCargo, MARGEM, 26);

  let y = 34;

  // Nas páginas seguintes, identifica o documento de forma discreta.
  const adicionarPagina = () => {
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`Relatório da vaga: ${dados.respostas.cargo}`, MARGEM, 13);
    y = 20;
  };

  const garantirEspaco = (altura: number) => {
    if (y + altura > LIMITE_CONTEUDO) adicionarPagina();
  };

  const paragrafo = (texto: string, tamanho = 9, estilo: "normal" | "bold" = "normal") => {
    const linhas = doc.splitTextToSize(texto, LARGURA_UTIL) as string[];
    const alturaLinha = tamanho * 0.42 + 0.8;
    for (const linha of linhas) {
      garantirEspaco(alturaLinha);
      doc.setFont("helvetica", estilo);
      doc.setFontSize(tamanho);
      doc.setTextColor(0, 0, 0);
      doc.text(linha, MARGEM, y);
      y += alturaLinha;
    }
  };

  // Divide o relatório em seções com título em negrito e linha inferior.
  const secao = (titulo: string) => {
    y += 3;
    garantirEspaco(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(titulo.toUpperCase(), MARGEM, y + 3);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.25);
    doc.line(MARGEM, y + 6, LARGURA_PAGINA - MARGEM, y + 6);
    y += 10;
  };

  // Imprime cada resposta em uma linha, com o nome do campo antes do valor.
  const campo = (rotulo: string, valor: string) => {
    const texto = valor.trim() || "Não informado";
    paragrafo(`${rotulo}: ${texto}`);
  };

  // Usa marcador e recuo para listas de responsabilidades e requisitos.
  const itemLista = (texto: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const linhas = doc.splitTextToSize(texto, LARGURA_UTIL - 7) as string[];
    const alturaLinha = 4.6;
    for (const [indice, linha] of linhas.entries()) {
      garantirEspaco(alturaLinha);
      if (indice === 0) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text("•", MARGEM + 1, y);
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(linha, MARGEM + 5, y);
      y += alturaLinha;
    }
    y += 1;
  };

  const tituloDescricao = (titulo: string, principal = false) => {
    const tamanho = principal ? 12 : 10;
    const alturaLinha = tamanho * 0.42 + 0.8;
    const linhas = doc.splitTextToSize(titulo, LARGURA_UTIL) as string[];
    y += principal ? 1 : 2;
    for (const linha of linhas) {
      garantirEspaco(alturaLinha);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(tamanho);
      doc.setTextColor(0, 0, 0);
      doc.text(linha, MARGEM, y);
      y += alturaLinha;
    }
    y += 1;
  };

  secao("Resumo da entrevista");
  for (const pergunta of PERGUNTAS) {
    campo(pergunta.rotulo, dados.respostas[pergunta.campo]);
  }

  if (dados.avaliacao) {
    const avaliacao = dados.avaliacao;
    secao("Aderência ao gabarito (PLN)");
    campo("Gabarito de referência", dados.nomeGabarito);
    campo("Similaridade entre os textos", `${(avaliacao.similarity * 100).toFixed(1)}%`);
    campo(
      "Nota da análise automática",
      `${avaliacao.score}/100 (${avaliacao.classification.label})`,
    );
    campo("Feedback", `${avaliacao.feedback.label}: ${avaliacao.feedback.message}`);
    if (avaliacao.missingTerms.length > 0) {
      campo("Termos importantes ausentes", avaliacao.missingTerms.join(", "));
    }
  }

  const resultadoGemini = dados.avaliacaoGemini;
  if (resultadoGemini) {
    secao("Revisão do Gemini");
    campo(
      "Avaliação do texto original",
      `${resultadoGemini.score}/100 (${rotuloVeredito(resultadoGemini.verdict)})`,
    );
    campo("Feedback do Gemini", resultadoGemini.feedback);
  }

  secao("Descrição completa da vaga");
  const descricaoFinal = resultadoGemini?.revisedDescription.trim() || dados.descricao;
  const linhasDescricao = descricaoFinal.split("\n");
  const primeiraLinha = linhasDescricao[0]?.trim().replace(/^#\s*/, "");
  const descricaoComecaComCargo =
    primeiraLinha?.toLowerCase() === dados.respostas.cargo.trim().toLowerCase();
  tituloDescricao(dados.respostas.cargo || "Descrição da vaga", true);

  for (const [indice, linhaOriginal] of linhasDescricao.entries()) {
    const linha = linhaOriginal.trim();
    if (indice === 0 && descricaoComecaComCargo) continue;
    if (linha === "") {
      y += 1.5;
    } else if (linha.startsWith("# ")) {
      tituloDescricao(linha.slice(2));
    } else if (linha.startsWith("## ")) {
      tituloDescricao(linha.slice(3));
    } else if (SECOES_DESCRICAO.has(linha)) {
      tituloDescricao(linha);
    } else if (/^[-•]\s*/.test(linha)) {
      itemLista(linha.replace(/^[-•]\s*/, ""));
    } else {
      paragrafo(linha);
    }
  }

  // Acrescenta apenas a numeração de página no rodapé.
  const totalPaginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    doc.setPage(pagina);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(`Página ${pagina} de ${totalPaginas}`, LARGURA_PAGINA - MARGEM, ALTURA_PAGINA - 8, {
      align: "right",
    });
  }

  doc.save(nomeArquivo(dados.respostas.cargo));
}
