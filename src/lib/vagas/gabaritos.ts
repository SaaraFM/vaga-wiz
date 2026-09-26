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
  {
    id: "designer-ux",
    cargo: "Designer UX/UI",
    area: "Design e Experiência do Usuário",
    palavrasChave: ["design", "ux", "ui", "figma", "prototipo", "interface", "usuario"],
    descricao: `Buscamos um Designer UX/UI para criar experiências digitais intuitivas e alinhadas ao negócio.
Responsabilidades: conduzir pesquisas com usuários, criar wireframes e protótipos interativos, definir guias de estilo, testar usabilidade e colaborar com desenvolvedores na implementação das interfaces.
Requisitos: domínio de Figma, portfólio com projetos de interface, conhecimento em acessibilidade, design centrado no usuário e comunicação visual.
Tecnologias: Figma, Adobe XD, Maze, Notion, plugins de acessibilidade.
Benefícios: vale refeição, plano de saúde, auxílio home office e verba para cursos e eventos da área.
Modelo de trabalho: híbrido.`,
  },
  {
    id: "marketing-digital",
    cargo: "Analista de Marketing Digital",
    area: "Marketing e Vendas",
    palavrasChave: ["marketing", "digital", "campanhas", "seo", "redes", "social", "metricas"],
    descricao: `Buscamos um Analista de Marketing Digital para planejar e executar estratégias de aquisição e relacionamento.
Responsabilidades: criar e otimizar campanhas pagas, gerenciar redes sociais, produzir conteúdos para blog e e-mail marketing, acompanhar métricas de conversão e propor melhorias com base em dados.
Requisitos: experiência com Google Ads e Meta Ads, noções de SEO e copywriting, análise de indicadores e organização para trabalhar com várias frentes.
Tecnologias: Google Analytics, Meta Business Suite, Semrush, RD Station, Excel.
Benefícios: vale refeição, plano de saúde, auxílio educação e bimestre de metas com bônus.
Modelo de trabalho: remoto.`,
  },
  {
    id: "devops",
    cargo: "Engenheiro de DevOps",
    area: "Infraestrutura e Cloud",
    palavrasChave: ["devops", "cloud", "aws", "docker", "kubernetes", "ci", "cd", "infraestrutura"],
    descricao: `Buscamos um Engenheiro de DevOps para automatizar e evoluir a infraestrutura de nossas plataformas.
Responsabilidades: manter pipelines de integração e entrega contínuas, administrar ambientes em nuvem, monitorar disponibilidade e performance, gerenciar contêineres e implementar práticas de segurança e backup.
Requisitos: experiência com AWS ou GCP, Docker e Kubernetes, infraestrutura como código, scripts em Python ou Bash e conhecimento em redes e segurança.
Tecnologias: AWS, Docker, Kubernetes, Terraform, GitHub Actions, Grafana.
Benefícios: vale refeição, plano de saúde, auxílio home office e certificações pagas pela empresa.
Modelo de trabalho: remoto.`,
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
