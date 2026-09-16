"""TF-IDF + similaridade do cosseno com scikit-learn."""

from __future__ import annotations

from dataclasses import dataclass, field

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from preprocessamento import preprocessar


@dataclass
class ResultadoAvaliacao:
    similaridade: float
    nota: int
    classificacao: str
    feedback_rotulo: str
    feedback_mensagem: str
    termos_gabarito: list[tuple[str, float]] = field(default_factory=list)
    termos_faltantes: list[str] = field(default_factory=list)


def classificar(nota: int) -> str:
    """0-40 baixa | 41-70 intermediária | 71-90 boa | 91-100 excelente."""
    if nota <= 40:
        return "Baixa qualidade"
    if nota <= 70:
        return "Qualidade intermediária"
    if nota <= 90:
        return "Boa descrição"
    return "Excelente descrição"


def gerar_feedback(nota: int) -> tuple[str, str]:
    if nota > 80:
        return ("Entendeu", "A descrição possui grande similaridade com o modelo esperado.")
    if nota >= 50:
        return (
            "Parcial",
            "A descrição possui alguns elementos importantes, mas pode ser melhorada.",
        )
    return ("Não entendeu", "A descrição possui pouca relação com o modelo esperado.")


def avaliar(descricao_gerada: str, descricao_ideal: str) -> ResultadoAvaliacao:
    """Pipeline completo: limpeza -> TF-IDF -> cosseno -> nota -> feedback."""
    texto_gerado = preprocessar(descricao_gerada)
    texto_ideal = preprocessar(descricao_ideal)

    vetorizador = TfidfVectorizer()
    matriz = vetorizador.fit_transform([texto_gerado, texto_ideal])

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
