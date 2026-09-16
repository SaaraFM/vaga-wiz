"""Pré-processamento de texto em português (versão Python do pipeline de PLN)."""

from __future__ import annotations

import re
import unicodedata

STOPWORDS_PT = {
    "a", "ao", "aos", "aquela", "aquelas", "aquele", "aqueles", "aquilo", "as", "ate",
    "com", "como", "da", "das", "de", "dela", "delas", "dele", "deles", "depois", "do",
    "dos", "e", "ela", "elas", "ele", "eles", "em", "entre", "era", "eram", "essa",
    "essas", "esse", "esses", "esta", "estamos", "estao", "estas", "este", "esteja",
    "estes", "estou", "eu", "foi", "fomos", "for", "foram", "fosse", "ha", "isso",
    "isto", "ja", "la", "lhe", "lhes", "mais", "mas", "me", "mesmo", "meu", "meus",
    "minha", "minhas", "muito", "na", "nao", "nas", "nem", "no", "nos", "nossa",
    "nossas", "nosso", "nossos", "num", "numa", "o", "os", "ou", "para", "pela",
    "pelas", "pelo", "pelos", "por", "qual", "quando", "que", "quem", "sao", "se",
    "seja", "sem", "ser", "seu", "seus", "so", "sobre", "sua", "suas", "tambem", "te",
    "tem", "tenha", "ter", "teu", "teus", "tua", "tuas", "um", "uma", "umas", "uns",
    "voce", "voces", "vos",
}


def remover_acentos(texto: str) -> str:
    """Remove a acentuação mantendo os caracteres base."""
    normalizado = unicodedata.normalize("NFD", texto)
    return "".join(c for c in normalizado if unicodedata.category(c) != "Mn")


def tokenizar(texto: str, remover_stopwords: bool = True, tamanho_minimo: int = 2) -> list[str]:
    """Aplica limpeza completa e devolve a lista de tokens."""
    limpo = remover_acentos(texto.lower())
    limpo = re.sub(r"[^a-z0-9\s]", " ", limpo)
    limpo = re.sub(r"\s+", " ", limpo).strip()

    if not limpo:
        return []

    tokens = [t for t in limpo.split(" ") if len(t) >= tamanho_minimo]
    if remover_stopwords:
        tokens = [t for t in tokens if t not in STOPWORDS_PT]
    return tokens


def preprocessar(texto: str, remover_stopwords: bool = True) -> str:
    """Converte para minúsculas, remove pontuação, caracteres especiais,
    stopwords em português e normaliza os espaços."""
    return " ".join(tokenizar(texto, remover_stopwords=remover_stopwords))


if __name__ == "__main__":
    exemplo = "Desenvolvedor Python, responsável por criar APIs!"
    print(f"entrada: {exemplo}")
    print(f"saida:   {preprocessar(exemplo)}")
