/**
 * Monta e baixa o relatório final da vaga em PDF.
 * Inclui respostas da entrevista, avaliação local, correção do Gemini quando
 * disponível e a descrição final em uma diagramação própria para impressão.
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
  readonly descricaoAntesGemini?: string | null;
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

  // Mantém a capa simples: título, cargo, data e uma linha divisória.
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Relatório de vaga", MARGEM, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(71, 85, 105);
  const linhasCargo = doc.splitTextToSize(
    dados.respostas.cargo.trim() || "Cargo não informado",
    LARGURA_UTIL,
  ) as string[];
  doc.text(linhasCargo.slice(0, 2), MARGEM, 25);
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, MARGEM, 37);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(MARGEM, 42, LARGURA_PAGINA - MARGEM, 42);

  let y = 51;

  // Nas páginas seguintes, repete um cabeçalho discreto para orientar a leitura.
  const adicionarPagina = () => {
    doc.addPage();
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("RELATÓRIO DE VAGA", MARGEM, 12);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(MARGEM, 16, LARGURA_PAGINA - MARGEM, 16);
    y = 23;
  };

  const garantirEspaco = (altura: number) => {
    if (y + altura > LIMITE_CONTEUDO) adicionarPagina();
  };

  const paragrafo = (texto: string, tamanho = 10, estilo: "normal" | "bold" = "normal") => {
    const linhas = doc.splitTextToSize(texto, LARGURA_UTIL) as string[];
    const alturaLinha = tamanho * 0.45 + 1.2;
    for (const linha of linhas) {
      garantirEspaco(alturaLinha);
      doc.setFont("helvetica", estilo);
      doc.setFontSize(tamanho);
      doc.setTextColor(51, 65, 85);
      doc.text(linha, MARGEM, y);
      y += alturaLinha;
    }
  };

  // Separa assuntos com título e linha fina, sem blocos coloridos.
  const secao = (titulo: string) => {
    y += 4;
    garantirEspaco(11);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(titulo, MARGEM, y + 4);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(MARGEM, y + 7, LARGURA_PAGINA - MARGEM, y + 7);
    y += 12;
  };

  // Alinha os rótulos em uma coluna e as respostas em outra, como em um formulário.
  const campo = (rotulo: string, valor: string) => {
    const texto = valor.trim() || "Não informado";
    const larguraRotulo = 48;
    const xValor = MARGEM + larguraRotulo + 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const linhasRotulo = doc.splitTextToSize(rotulo, larguraRotulo) as string[];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const linhasValor = doc.splitTextToSize(texto, LARGURA_UTIL - larguraRotulo - 4) as string[];
    const totalLinhas = Math.max(linhasRotulo.length, linhasValor.length);
    const alturaLinha = 5.2;
    for (let indice = 0; indice < totalLinhas; indice += 1) {
      garantirEspaco(alturaLinha + 1);
      if (linhasRotulo[indice]) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(linhasRotulo[indice], MARGEM, y);
      }
      if (linhasValor[indice]) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(linhasValor[indice], xValor, y);
      }
      y += alturaLinha;
    }
    y += 2;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(MARGEM, y, LARGURA_PAGINA - MARGEM, y);
    y += 2;
  };

  // Exibe o parecer em texto simples, mantendo o mesmo alinhamento das respostas.
  const cartaoFeedback = (rotulo: string, mensagem: string) => {
    campo(rotulo, mensagem);
  };

  // Usa um marcador discreto e recuo para facilitar a leitura das listas.
  const itemLista = (texto: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const linhas = doc.splitTextToSize(texto, LARGURA_UTIL - 7) as string[];
    const alturaLinha = 5.2;
    for (const [indice, linha] of linhas.entries()) {
      garantirEspaco(alturaLinha);
      if (indice === 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text("–", MARGEM + 1, y);
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(linha, MARGEM + 5, y);
      y += alturaLinha;
    }
    y += 1;
  };

  const tituloDescricao = (titulo: string, principal = false) => {
    y += principal ? 1 : 2;
    garantirEspaco(9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(principal ? 13 : 10.5);
    doc.setTextColor(30, 41, 59);
    doc.text(titulo, MARGEM, y);
    y += principal ? 7 : 6;
  };

  secao("Resumo da entrevista");
  for (const pergunta of PERGUNTAS) {
    campo(pergunta.rotulo, dados.respostas[pergunta.campo]);
  }

  if (dados.avaliacao) {
    const avaliacao = dados.avaliacao;
    secao("Avaliação automática da descrição");
    campo("Gabarito de referência", dados.nomeGabarito);
    campo("Similaridade entre os textos", `${(avaliacao.similarity * 100).toFixed(1)}%`);
    campo(
      "Nota da análise automática",
      `${avaliacao.score}/100 — ${avaliacao.classification.label}`,
    );
    cartaoFeedback(avaliacao.feedback.label, avaliacao.feedback.message);
    if (avaliacao.missingTerms.length > 0) {
      campo("Termos importantes ausentes", avaliacao.missingTerms.join(", "));
    }
  }

  const resultadoGemini = dados.avaliacaoGemini;
  if (resultadoGemini) {
    secao("Correção feita pelo Gemini");
    campo(
      "Avaliação do texto original",
      `${resultadoGemini.score}/100 — ${rotuloVeredito(resultadoGemini.verdict)}`,
    );
    cartaoFeedback("Feedback do Gemini", resultadoGemini.feedback);

    const textoOriginal = dados.descricaoAntesGemini?.trim();
    if (textoOriginal) {
      tituloDescricao("Descrição antes da correção");
      for (const linha of textoOriginal.split("\n")) {
        if (linha.trim() === "") y += 1.5;
        else paragrafo(linha.replace(/^#{1,2}\s*/, "").replace(/^-\s*/, ""));
      }
    }
  }

  secao(resultadoGemini ? "Descrição final corrigida" : "Descrição completa da vaga");
  const descricaoFinal = resultadoGemini?.revisedDescription.trim() || dados.descricao;
  for (const [indice, linhaOriginal] of descricaoFinal.split("\n").entries()) {
    const linha = linhaOriginal.trim();
    if (linha === "") {
      y += 1.5;
    } else if (linha.startsWith("# ")) {
      tituloDescricao(linha.slice(2), indice === 0);
    } else if (linha.startsWith("## ")) {
      tituloDescricao(linha.slice(3));
    } else if (indice === 0) {
      tituloDescricao(linha, true);
    } else if (SECOES_DESCRICAO.has(linha)) {
      tituloDescricao(linha);
    } else if (/^[-•]\s*/.test(linha)) {
      itemLista(linha.replace(/^[-•]\s*/, ""));
    } else {
      paragrafo(linha);
    }
  }

  // Numera todas as páginas depois que o conteúdo estiver pronto.
  const totalPaginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    doc.setPage(pagina);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(MARGEM, ALTURA_PAGINA - 13, LARGURA_PAGINA - MARGEM, ALTURA_PAGINA - 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("VagaWiz · Relatório de vaga", MARGEM, ALTURA_PAGINA - 8);
    doc.text(`${pagina} / ${totalPaginas}`, LARGURA_PAGINA - MARGEM, ALTURA_PAGINA - 8, {
      align: "right",
    });
  }

  doc.save(nomeArquivo(dados.respostas.cargo));
}
