"""Testes obrigatórios do pipeline de PLN (execução: python testes.py)."""

from __future__ import annotations

from gabaritos import GABARITOS
from preprocessamento import preprocessar
from similaridade import avaliar

GABARITO_PYTHON = GABARITOS[0].descricao

CASOS = [
    (
        "Teste 1 — descrição semelhante ao modelo",
        """Estamos buscando um Desenvolvedor Python Júnior para atuar no desenvolvimento de aplicações backend.
Responsabilidades: desenvolver e manter APIs REST, integrar banco de dados relacional, escrever testes automatizados e participar de code review.
Requisitos: Python, lógica de programação, banco de dados SQL e versionamento com Git.
Tecnologias: Python, Django, PostgreSQL, Docker, Git.
Benefícios: vale refeição, plano de saúde e plano de carreira.
Modelo de trabalho: híbrido.""",
        lambda nota: nota >= 71,
        "alta similaridade (>= 71)",
    ),
    (
        "Teste 2 — descrição diferente do modelo",
        """Procuramos um Chef de Cozinha para restaurante italiano.
Responsabilidades: criar cardápios, controlar estoque de ingredientes e liderar a brigada de cozinha.
Benefícios: refeição no local e vale transporte.""",
        lambda nota: nota <= 40,
        "baixa similaridade (<= 40)",
    ),
    (
        "Teste 3 — mesmo contexto, palavras diferentes (limitação do TF-IDF)",
        """Procuramos pessoa programadora iniciante para construir serviços de servidor.
Vai criar interfaces de integração web, conectar repositórios de informação e validar rotinas com verificações automáticas.
Regime de atuação misto entre escritório e casa.""",
        lambda nota: nota <= 40,
        "baixa similaridade mesmo com contexto equivalente (<= 40)",
    ),
]


def main() -> None:
    exemplo = "Desenvolvedor Python, responsável por criar APIs!"
    print("Pré-processamento de exemplo:")
    print(f"  entrada: {exemplo}")
    print(f"  saida:   {preprocessar(exemplo)}\n")

    falhas = 0
    for nome, texto, verificacao, expectativa in CASOS:
        resultado = avaliar(texto, GABARITO_PYTHON)
        passou = verificacao(resultado.nota)
        falhas += 0 if passou else 1

        print(f"{'PASSOU' if passou else 'FALHOU'} — {nome}")
        print(f"  similaridade : {resultado.similaridade * 100:.1f}%")
        print(f"  nota         : {resultado.nota}/100 ({resultado.classificacao})")
        print(f"  feedback     : {resultado.feedback_rotulo} — {resultado.feedback_mensagem}")
        print(f"  esperado     : {expectativa}\n")

    print(
        "Limitação demonstrada no Teste 3: o TF-IDF compara palavras literais, não significado.\n"
        "Sinônimos reduzem a nota mesmo quando o contexto é equivalente."
    )
    assert falhas == 0, f"{falhas} teste(s) falharam."
    print("\nTodos os testes passaram.")


if __name__ == "__main__":
    main()
