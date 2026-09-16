"""Gerador automático da descrição de vaga a partir das respostas do chatbot."""

from __future__ import annotations

import re

CAMPOS = (
    ("cargo", "Cargo da vaga"),
    ("area", "Área de atuação"),
    ("nivel", "Nível de experiência"),
    ("tecnologias", "Tecnologias necessárias"),
    ("responsabilidades", "Responsabilidades"),
    ("requisitos", "Requisitos"),
    ("beneficios", "Benefícios"),
    ("modelo_trabalho", "Modelo de trabalho"),
)


def _itens(texto: str) -> list[str]:
    partes = re.split(r"[;,\n]", texto)
    return [p.strip().lstrip("-• ").capitalize() for p in partes if p.strip()]


def gerar_descricao(respostas: dict[str, str]) -> str:
    """Monta a descrição profissional organizada por seções."""
    cargo = respostas.get("cargo", "")
    area = respostas.get("area", "")
    nivel = respostas.get("nivel", "")
    tecnologias = respostas.get("tecnologias", "")

    resumo = (
        f"Estamos buscando um(a) {cargo}"
        + (f" de nível {nivel.lower()}" if nivel else "")
        + f" para atuar na área de {area.lower()}. A pessoa selecionada participará do "
        f"desenvolvimento e da evolução de soluções, trabalhando com {tecnologias.lower()} "
        "em um ambiente colaborativo e orientado a resultados."
    )

    linhas = [f"# {cargo}", "", "## Resumo da oportunidade", resumo]

    for chave, titulo in (
        ("responsabilidades", "Responsabilidades"),
        ("requisitos", "Requisitos"),
        ("tecnologias", "Tecnologias"),
        ("beneficios", "Benefícios"),
    ):
        linhas += ["", f"## {titulo}"]
        linhas += [f"- {item}" for item in _itens(respostas.get(chave, ""))]

    linhas += ["", "## Modelo de trabalho", respostas.get("modelo_trabalho", "").capitalize()]

    return "\n".join(linhas).strip()
