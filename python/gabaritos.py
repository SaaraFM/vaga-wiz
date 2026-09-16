"""Banco de descrições esperadas (gabaritos) usadas na comparação."""

from __future__ import annotations

import unicodedata
from dataclasses import dataclass


@dataclass(frozen=True)
class Gabarito:
    id: str
    cargo: str
    area: str
    palavras_chave: tuple[str, ...]
    descricao: str


GABARITOS: tuple[Gabarito, ...] = (
    Gabarito(
        id="dev-python-jr",
        cargo="Desenvolvedor Python Júnior",
        area="Desenvolvimento Backend",
        palavras_chave=("python", "api", "backend", "banco", "dados", "django", "sql"),
        descricao=(
            "Buscamos um Desenvolvedor Python Júnior para atuar no desenvolvimento de aplicações backend. "
            "Responsabilidades: desenvolver e manter APIs REST, integrar serviços com banco de dados relacional, "
            "escrever testes automatizados, corrigir bugs e participar de code review. "
            "Requisitos: conhecimento em Python, lógica de programação, banco de dados SQL, versionamento com Git "
            "e noções de arquitetura de software. "
            "Tecnologias: Python, Django ou Flask, PostgreSQL, Docker, Git. "
            "Benefícios: vale refeição, plano de saúde, auxílio home office e plano de carreira. "
            "Modelo de trabalho: híbrido."
        ),
    ),
    Gabarito(
        id="analista-dados",
        cargo="Analista de Dados",
        area="Dados e BI",
        palavras_chave=("dados", "sql", "power", "bi", "dashboard", "analise", "python"),
        descricao=(
            "Buscamos um Analista de Dados para transformar dados em informação para o negócio. "
            "Responsabilidades: coletar e tratar dados, construir dashboards, criar relatórios analíticos, "
            "automatizar rotinas de extração e apoiar áreas de negócio com análises. "
            "Requisitos: SQL avançado, estatística básica, modelagem de dados e pensamento analítico. "
            "Tecnologias: SQL, Python, Power BI, Excel, ferramentas de ETL. "
            "Benefícios: vale refeição, plano de saúde, auxílio educação e horário flexível. "
            "Modelo de trabalho: remoto."
        ),
    ),
    Gabarito(
        id="front-react",
        cargo="Desenvolvedor Front-end React",
        area="Desenvolvimento Front-end",
        palavras_chave=("react", "javascript", "typescript", "interface", "frontend", "css"),
        descricao=(
            "Buscamos um Desenvolvedor Front-end React para construir interfaces web modernas e acessíveis. "
            "Responsabilidades: desenvolver componentes reutilizáveis, integrar APIs REST, garantir responsividade "
            "e performance, escrever testes de interface e colaborar com design. "
            "Requisitos: JavaScript, TypeScript, React, HTML, CSS, versionamento com Git e noções de acessibilidade. "
            "Tecnologias: React, TypeScript, Tailwind CSS, Vite, Git. "
            "Benefícios: vale refeição, plano de saúde, auxílio home office e day off de aniversário. "
            "Modelo de trabalho: remoto."
        ),
    ),
    Gabarito(
        id="qa",
        cargo="Analista de Qualidade (QA)",
        area="Qualidade de Software",
        palavras_chave=("teste", "qualidade", "automacao", "qa", "cypress", "bug"),
        descricao=(
            "Buscamos um Analista de Qualidade para garantir a qualidade das entregas de software. "
            "Responsabilidades: criar planos de teste, executar testes manuais e automatizados, registrar e "
            "acompanhar bugs e apoiar o time no processo de release. "
            "Requisitos: testes funcionais, automação de testes, escrita de casos de teste e atenção a detalhes. "
            "Tecnologias: Cypress, Playwright, Postman, SQL, Git. "
            "Benefícios: vale refeição, plano de saúde, auxílio educação e plano de carreira. "
            "Modelo de trabalho: híbrido."
        ),
    ),
    Gabarito(
        id="rh",
        cargo="Analista de Recursos Humanos",
        area="Recursos Humanos",
        palavras_chave=("recrutamento", "selecao", "pessoas", "rh", "entrevista"),
        descricao=(
            "Buscamos um Analista de Recursos Humanos para atuar em recrutamento e seleção. "
            "Responsabilidades: conduzir processos seletivos, realizar entrevistas, divulgar vagas, acompanhar "
            "indicadores de contratação e apoiar o onboarding. "
            "Requisitos: experiência em recrutamento e seleção, comunicação clara e organização. "
            "Tecnologias: sistemas de ATS, pacote Office, LinkedIn Recruiter. "
            "Benefícios: vale refeição, plano de saúde, auxílio educação e horário flexível. "
            "Modelo de trabalho: presencial."
        ),
    ),
)


def _sem_acento(texto: str) -> str:
    normalizado = unicodedata.normalize("NFD", texto.lower())
    return "".join(c for c in normalizado if unicodedata.category(c) != "Mn")


def sugerir_gabarito(cargo: str, area: str = "") -> Gabarito:
    """Escolhe o gabarito mais próximo do cargo/área informados."""
    alvo = _sem_acento(f"{cargo} {area}")
    return max(
        GABARITOS,
        key=lambda g: sum(1 for palavra in g.palavras_chave if palavra in alvo),
    )
