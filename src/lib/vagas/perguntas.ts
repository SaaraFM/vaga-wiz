/** Roteiro de perguntas do chatbot de criação de vagas. */

export type CampoVaga =
  | "cargo"
  | "area"
  | "nivel"
  | "tecnologias"
  | "responsabilidades"
  | "requisitos"
  | "beneficios"
  | "modeloTrabalho";

export interface Pergunta {
  readonly campo: CampoVaga;
  readonly rotulo: string;
  readonly texto: string;
  readonly placeholder: string;
  readonly sugestoes: readonly string[];
}

export const PERGUNTAS: readonly Pergunta[] = [
  {
    campo: "cargo",
    rotulo: "Cargo",
    texto: "Vamos começar! Qual é o cargo da vaga?",
    placeholder: "Ex.: Desenvolvedor Python Júnior",
    sugestoes: [
      "Desenvolvedor Python Júnior",
      "Analista de Dados",
      "Desenvolvedor Front-end React",
    ],
  },
  {
    campo: "area",
    rotulo: "Área de atuação",
    texto: "Qual é a área de atuação dessa vaga?",
    placeholder: "Ex.: Tecnologia / Desenvolvimento Backend",
    sugestoes: ["Desenvolvimento Backend", "Dados e BI", "Desenvolvimento Front-end"],
  },
  {
    campo: "nivel",
    rotulo: "Nível de experiência",
    texto: "Qual o nível de experiência esperado?",
    placeholder: "Ex.: Júnior, com 1 ano de experiência",
    sugestoes: ["Júnior", "Pleno", "Sênior"],
  },
  {
    campo: "tecnologias",
    rotulo: "Tecnologias",
    texto: "Quais tecnologias e ferramentas são necessárias?",
    placeholder: "Ex.: Python, Django, PostgreSQL, Git, Docker",
    sugestoes: ["Python, Django, PostgreSQL, Git", "SQL, Power BI, Python, Excel"],
  },
  {
    campo: "responsabilidades",
    rotulo: "Responsabilidades",
    texto: "Quais serão as principais responsabilidades?",
    placeholder: "Ex.: Desenvolver APIs REST, manter integrações, escrever testes",
    sugestoes: [
      "Desenvolver e manter APIs REST, integrar banco de dados, escrever testes automatizados",
    ],
  },
  {
    campo: "requisitos",
    rotulo: "Requisitos",
    texto: "Quais são os requisitos obrigatórios?",
    placeholder: "Ex.: Superior em andamento em TI, lógica de programação, versionamento",
    sugestoes: [
      "Formação em andamento na área de tecnologia, conhecimento em lógica de programação e versionamento com Git",
    ],
  },
  {
    campo: "beneficios",
    rotulo: "Benefícios",
    texto: "Quais benefícios a empresa oferece?",
    placeholder: "Ex.: Vale refeição, plano de saúde, auxílio educação",
    sugestoes: ["Vale refeição, plano de saúde, auxílio home office, plano de carreira"],
  },
  {
    campo: "modeloTrabalho",
    rotulo: "Modelo de trabalho",
    texto: "Por fim, qual o modelo de trabalho?",
    placeholder: "Ex.: Híbrido, 3 dias presenciais em São Paulo",
    sugestoes: ["Remoto", "Híbrido", "Presencial"],
  },
] as const;

export type RespostasVaga = Record<CampoVaga, string>;

export const RESPOSTAS_VAZIAS: RespostasVaga = {
  cargo: "",
  area: "",
  nivel: "",
  tecnologias: "",
  responsabilidades: "",
  requisitos: "",
  beneficios: "",
  modeloTrabalho: "",
};
