/** Gera a descrição profissional da vaga a partir das respostas do chatbot. */

import type { RespostasVaga } from "./perguntas";

function listar(texto: string): string[] {
  return texto
    .split(/[;\n]|,(?![^()]*\))/g)
    .map((item) => item.trim().replace(/^[-•]\s*/, ""))
    .filter((item) => item.length > 0);
}

function capitalizar(texto: string): string {
  if (texto.length === 0) return texto;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function gerarDescricao(respostas: RespostasVaga): string {
  const {
    cargo,
    area,
    nivel,
    tecnologias,
    responsabilidades,
    requisitos,
    beneficios,
    modeloTrabalho,
  } = respostas;

  const resumo = `Estamos buscando um(a) ${cargo} ${nivel ? `de nível ${nivel.toLowerCase()} ` : ""}para atuar na área de ${area.toLowerCase()}. A pessoa selecionada participará do desenvolvimento e da evolução de soluções, trabalhando com ${tecnologias.toLowerCase()} em um ambiente colaborativo e orientado a resultados.`;

  const blocos = [
    `# ${cargo}`,
    "",
    "## Resumo da oportunidade",
    resumo,
    "",
    "## Responsabilidades",
    ...listar(responsabilidades).map((item) => `- ${capitalizar(item)}`),
    "",
    "## Requisitos",
    ...listar(requisitos).map((item) => `- ${capitalizar(item)}`),
    "",
    "## Tecnologias",
    ...listar(tecnologias).map((item) => `- ${capitalizar(item)}`),
    "",
    "## Benefícios",
    ...listar(beneficios).map((item) => `- ${capitalizar(item)}`),
    "",
    "## Modelo de trabalho",
    capitalizar(modeloTrabalho),
  ];

  return blocos.join("\n").trim();
}
