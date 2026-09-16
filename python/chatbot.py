"""Chatbot de linha de comando: coleta respostas, gera a vaga e avalia com PLN.

Execução:
    cd python && pip install -r requirements.txt && python chatbot.py
"""

from __future__ import annotations

from gabaritos import sugerir_gabarito
from gerador import CAMPOS, gerar_descricao
from similaridade import avaliar

PERGUNTAS = {
    "cargo": "Qual é o cargo da vaga?",
    "area": "Qual é a área de atuação?",
    "nivel": "Qual o nível de experiência?",
    "tecnologias": "Quais tecnologias são necessárias?",
    "responsabilidades": "Quais serão as responsabilidades?",
    "requisitos": "Quais são os requisitos?",
    "beneficios": "Quais benefícios a empresa oferece?",
    "modelo_trabalho": "Qual o modelo de trabalho (remoto/híbrido/presencial)?",
}


def coletar_respostas() -> dict[str, str]:
    print("=== Criador de Descrição de Vagas (PLN) ===\n")
    respostas: dict[str, str] = {}
    for chave, _rotulo in CAMPOS:
        respostas[chave] = input(f"Bot: {PERGUNTAS[chave]}\nVocê: ").strip()
        print()
    return respostas


def main() -> None:
    respostas = coletar_respostas()

    descricao = gerar_descricao(respostas)
    print("\n--- Descrição gerada ---\n")
    print(descricao)

    gabarito = sugerir_gabarito(respostas["cargo"], respostas["area"])
    print(f"\n--- Gabarito utilizado: {gabarito.cargo} ---")

    resultado = avaliar(descricao, gabarito.descricao)
    print("\n--- Avaliação PLN ---")
    print(f"Similaridade : {resultado.similaridade * 100:.1f}%")
    print(f"Nota         : {resultado.nota}/100 ({resultado.classificacao})")
    print(f"Feedback     : {resultado.feedback_rotulo} — {resultado.feedback_mensagem}")
    if resultado.termos_faltantes:
        print(f"Termos ausentes: {', '.join(resultado.termos_faltantes)}")


if __name__ == "__main__":
    main()
