/** Banco de descrições esperadas (gabaritos) usado na comparação por PLN. */

export interface Gabarito {
  readonly id: string;
  readonly cargo: string;
  readonly area: string;
  readonly palavrasChave: readonly string[];
  readonly descricao: string;
}

export const GABARITOS: readonly Gabarito[] = [
  {
    id: "dev-python-jr",
    cargo: "Desenvolvedor Python Júnior",
    area: "Desenvolvimento Backend",
    palavrasChave: ["python", "api", "backend", "banco", "dados", "django", "sql"],
    descricao: `Buscamos um Desenvolvedor Python Júnior para atuar no desenvolvimento de aplicações backend.
Responsabilidades: desenvolver e manter APIs REST, integrar serviços com banco de dados relacional, escrever testes automatizados, corrigir bugs e participar de code review.
Requisitos: conhecimento em Python, lógica de programação, banco de dados SQL, versionamento com Git e noções de arquitetura de software.
Tecnologias: Python, Django ou Flask, PostgreSQL, Docker, Git.
Benefícios: vale refeição, plano de saúde, auxílio home office e plano de carreira.
Modelo de trabalho: híbrido.`,
  },
  {
    id: "analista-dados",
    cargo: "Analista de Dados",
    area: "Dados e BI",
    palavrasChave: ["dados", "sql", "power", "bi", "dashboard", "analise", "python"],
    descricao: `Buscamos um Analista de Dados para transformar dados em informação para o negócio.
Responsabilidades: coletar e tratar dados, construir dashboards, criar relatórios analíticos, automatizar rotinas de extração e apoiar áreas de negócio com análises.
Requisitos: SQL avançado, estatística básica, modelagem de dados, comunicação com áreas de negócio e pensamento analítico.
Tecnologias: SQL, Python, Power BI, Excel, ferramentas de ETL.
Benefícios: vale refeição, plano de saúde, auxílio educação e horário flexível.
Modelo de trabalho: remoto.`,
  },
  {
    id: "front-react",
    cargo: "Desenvolvedor Front-end React",
    area: "Desenvolvimento Front-end",
    palavrasChave: ["react", "javascript", "typescript", "interface", "frontend", "css"],
    descricao: `Buscamos um Desenvolvedor Front-end React para construir interfaces web modernas e acessíveis.
Responsabilidades: desenvolver componentes reutilizáveis, integrar APIs REST, garantir responsividade e performance, escrever testes de interface e colaborar com design.
Requisitos: JavaScript, TypeScript, React, HTML, CSS, versionamento com Git e noções de acessibilidade.
Tecnologias: React, TypeScript, Tailwind CSS, Vite, Git.
Benefícios: vale refeição, plano de saúde, auxílio home office e day off de aniversário.
Modelo de trabalho: remoto.`,
  },
  {
    id: "qa",
    cargo: "Analista de Qualidade (QA)",
    area: "Qualidade de Software",
    palavrasChave: ["teste", "qualidade", "automacao", "qa", "cypress", "bug"],
    descricao: `Buscamos um Analista de Qualidade para garantir a qualidade das entregas de software.
Responsabilidades: criar planos de teste, executar testes manuais e automatizados, registrar e acompanhar bugs, apoiar o time no processo de release.
Requisitos: conhecimento em testes funcionais, automação de testes, escrita de casos de teste e atenção a detalhes.
Tecnologias: Cypress, Playwright, Postman, SQL, Git.
Benefícios: vale refeição, plano de saúde, auxílio educação e plano de carreira.
Modelo de trabalho: híbrido.`,
  },
  {
    id: "rh",
    cargo: "Analista de Recursos Humanos",
    area: "Recursos Humanos",
    palavrasChave: ["recrutamento", "selecao", "pessoas", "rh", "entrevista"],
    descricao: `Buscamos um Analista de Recursos Humanos para atuar em recrutamento e seleção.
Responsabilidades: conduzir processos seletivos, realizar entrevistas, divulgar vagas, acompanhar indicadores de contratação e apoiar o onboarding.
Requisitos: experiência em recrutamento e seleção, comunicação clara, organização e conhecimento em legislação trabalhista básica.
Tecnologias: sistemas de ATS, pacote Office, LinkedIn Recruiter.
Benefícios: vale refeição, plano de saúde, auxílio educação e horário flexível.
Modelo de trabalho: presencial.`,
  },
] as const;

/** Escolhe o gabarito mais próximo do cargo/área informados pelo usuário. */
export function sugerirGabarito(cargo: string, area = ""): Gabarito {
  const alvo = `${cargo} ${area}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  let melhor = GABARITOS[0] as Gabarito;
  let melhorPontuacao = -1;

  for (const gabarito of GABARITOS) {
    const pontuacao = gabarito.palavrasChave.reduce(
      (acc, palavra) => (alvo.includes(palavra) ? acc + 1 : acc),
      0,
    );
    if (pontuacao > melhorPontuacao) {
      melhorPontuacao = pontuacao;
      melhor = gabarito;
    }
  }

  return melhor;
}
