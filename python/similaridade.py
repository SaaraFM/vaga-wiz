"""Compara uma descrição de vaga com o texto de referência (o gabarito).

O programa dá mais importância às palavras que ajudam a distinguir cada texto,
calcula quanto os dois textos se parecem e monta uma nota com explicações.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from preprocessamento import preprocessar


@dataclass
class ResultadoAvaliacao:
    """Guarda o resultado que será mostrado ao final da comparação."""
    similaridade: float
    nota: int
    classificacao: str
    feedback_rotulo: str
    feedback_mensagem: str
    termos_gabarito: list[tuple[str, float]] = field(default_factory=list)
    termos_faltantes: list[str] = field(default_factory=list)


def classificar(nota: int) -> str:
    """Converte a nota em um rótulo fácil de entender, como "Boa descrição"."""
    if nota <= 40:
        return "Baixa qualidade"
    if nota <= 70:
        return "Qualidade intermediária"
    if nota <= 90:
        return "Boa descrição"
    return "Excelente descrição"


def gerar_feedback(nota: int) -> tuple[str, str]:
    """Escolhe uma mensagem para explicar o que a nota quer dizer."""
    if nota > 80:
        return ("Entendeu", "A descrição possui grande similaridade com o modelo esperado.")
    if nota >= 50:
        return (
            "Parcial",
            "A descrição possui alguns elementos importantes, mas pode ser melhorada.",
        )
    return ("Não entendeu", "A descrição possui pouca relação com o modelo esperado.")


def avaliar(descricao_gerada: str, descricao_ideal: str) -> ResultadoAvaliacao:
    """Compara os textos limpos e reúne nota, explicação e palavras importantes ausentes."""
    texto_gerado = preprocessar(descricao_gerada)
    texto_ideal = preprocessar(descricao_ideal)

    # Dá mais peso às palavras úteis para diferenciar os textos e menos às comuns.
    vetorizador = TfidfVectorizer()
    matriz = vetorizador.fit_transform([texto_gerado, texto_ideal])

    # O resultado fica entre 0 (poucas palavras em comum) e 1 (textos muito parecidos).
    similaridade = float(cosine_similarity(matriz[0], matriz[1])[0][0])
    nota = round(similaridade * 100)
    rotulo, mensagem = gerar_feedback(nota)

    vocabulario = vetorizador.get_feature_names_out()
    pesos_ideal = matriz[1].toarray()[0]
    termos_gabarito = sorted(
        ((vocabulario[i], float(p)) for i, p in enumerate(pesos_ideal) if p > 0),
        key=lambda item: item[1],
        reverse=True,
    )[:10]

    tokens_gerados = set(texto_gerado.split())
    # Lista palavras importantes do gabarito que não aparecem na descrição criada.
    termos_faltantes = [t for t, _ in termos_gabarito if t not in tokens_gerados][:8]

    return ResultadoAvaliacao(
        similaridade=similaridade,
        nota=nota,
        classificacao=classificar(nota),
        feedback_rotulo=rotulo,
        feedback_mensagem=mensagem,
        termos_gabarito=termos_gabarito,
        termos_faltantes=termos_faltantes,
    )
