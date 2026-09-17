# PLN — Criador de Descrição de Vagas

Aplicação que gera descrições de vagas por meio de um **chatbot** e avalia a qualidade da descrição
criada comparando-a com uma **descrição ideal (gabarito)** usando técnicas de Processamento de
Linguagem Natural: pré-processamento, **TF-IDF** e **similaridade do cosseno**.

O resultado apresenta **similaridade (0 a 1)**, **nota (0 a 100)**, **classificação de qualidade** e
**feedback automático**.

---

## Objetivo

Atender aos requisitos da disciplina:

1. Receber uma entrada do usuário (respostas do chatbot).
2. Possuir uma resposta esperada (banco de gabaritos ou gabarito próprio).
3. Comparar a descrição criada com a descrição esperada.
4. Gerar similaridade, nota de 0 a 100 e feedback automático.

---

## Tecnologias utilizadas

| Camada        | Tecnologia                                                              |
| ------------- | ----------------------------------------------------------------------- |
| Interface web | React 19, TypeScript, TanStack Start, Tailwind CSS                      |
| PLN na web    | Implementação própria de TF-IDF e similaridade do cosseno em TypeScript |
| PLN em Python | Python 3, scikit-learn (`TfidfVectorizer`, `cosine_similarity`)         |
| Testes        | Script de testes em TypeScript (`bun`) e em Python                      |

> A versão web e a versão Python implementam **o mesmo pipeline**, com a mesma fórmula de IDF
> (`smooth_idf`) e normalização L2, produzindo resultados equivalentes.

---

## Como executar

### Aplicação web (chatbot + avaliação)

```bash
bun install      # ou npm install
bun run dev      # http://localhost:8080
```

### Testes do pipeline (TypeScript)

```bash
bun tests/testes-pln.ts
```

### Versão Python (linha de comando)

```bash
cd python
pip install -r requirements.txt
python chatbot.py     # chatbot interativo + avaliação
python testes.py      # testes obrigatórios
```

### Publicação no GitHub Pages

O projeto possui um build **estático (SPA)** próprio para o GitHub Pages:

```bash
bun run build:pages   # gera a pasta dist-pages/
```

A publicação é automática: a cada push na branch `main`, o workflow
`.github/workflows/deploy-pages.yml` gera o build estático e publica no GitHub Pages.

Para ativar (uma única vez): no repositório, acesse **Settings → Pages → Build and deployment →
Source: GitHub Actions**. O site fica disponível em
`https://saarafm.github.io/descricao_vagas/`.


---

## Estrutura do projeto

```
src/
  lib/nlp/
    preprocess.ts     # limpeza do texto e stopwords em português
    tfidf.ts          # vetorização TF-IDF
    similarity.ts     # similaridade do cosseno
    scoring.ts        # nota, classificação e feedback
    evaluate.ts       # orquestração do pipeline
  lib/vagas/
    perguntas.ts      # roteiro do chatbot
    gerador.ts        # geração da descrição profissional
    gabaritos.ts      # banco de descrições esperadas
  components/vaga/
    ChatVaga.tsx      # interface conversacional
    PainelResultado.tsx # descrição gerada + avaliação
  routes/index.tsx    # página principal
python/
  preprocessamento.py similaridade.py gabaritos.py gerador.py chatbot.py testes.py
tests/
  testes-pln.ts
```

Cada responsabilidade está isolada: interface/chatbot, pré-processamento, TF-IDF, similaridade,
sistema de nota e feedback.

---

## Explicação do PLN

### 1. Pré-processamento

O texto passa por uma limpeza antes de qualquer cálculo:

1. Conversão para letras minúsculas.
2. Remoção de acentuação.
3. Remoção de pontuação e caracteres especiais.
4. Remoção de stopwords em português (`de`, `para`, `com`, `que`, ...).
5. Normalização de espaços.

```
Entrada: "Desenvolvedor Python, responsável por criar APIs!"
Saída:   "desenvolvedor python responsavel criar apis"
```

### 2. TF-IDF

O TF-IDF transforma texto em vetores numéricos ponderando a importância de cada palavra:

- **TF (Term Frequency):** quantas vezes o termo aparece no documento.
- **IDF (Inverse Document Frequency):** o quanto o termo é raro no conjunto de documentos.

\[
\text{idf}(t) = \ln\left(\frac{1 + n}{1 + \text{df}(t)}\right) + 1
\qquad
\text{tfidf}(t, d) = \text{tf}(t, d) \times \text{idf}(t)
\]

Ao final, cada vetor é normalizado (L2). Palavras comuns às duas descrições pesam menos;
palavras características (como `python`, `api`, `dashboard`) pesam mais.

Em Python isso é feito com `TfidfVectorizer` do scikit-learn.

### 3. Similaridade do cosseno

Mede o ângulo entre os dois vetores, retornando um valor entre 0 e 1:

\[
\cos(\theta) = \frac{A \cdot B}{\lVert A \rVert \, \lVert B \rVert}
\]

- `0.85` → alta similaridade
- `0.30` → baixa similaridade

### 4. Sistema de nota

```
nota = similaridade * 100
```

| Faixa  | Classificação           |
| ------ | ----------------------- |
| 0–40   | Baixa qualidade         |
| 41–70  | Qualidade intermediária |
| 71–90  | Boa descrição           |
| 91–100 | Excelente descrição     |

### 5. Feedback automático

| Nota          | Feedback                                                                               |
| ------------- | -------------------------------------------------------------------------------------- |
| Acima de 80   | **Entendeu** — a descrição possui grande similaridade com o modelo esperado.           |
| Entre 50 e 80 | **Parcial** — a descrição possui alguns elementos importantes, mas pode ser melhorada. |
| Abaixo de 50  | **Não entendeu** — a descrição possui pouca relação com o modelo esperado.             |

---

## Funcionamento da aplicação

1. **Chatbot** — faz 8 perguntas: cargo, área de atuação, nível de experiência, tecnologias,
   responsabilidades, requisitos, benefícios e modelo de trabalho.
2. **Gerador** — monta a descrição com título, resumo da oportunidade, responsabilidades,
   requisitos, tecnologias, benefícios e modelo de trabalho.
3. **Gabarito** — o sistema sugere automaticamente o modelo mais próximo do cargo informado;
   também é possível colar um gabarito próprio.
4. **Avaliação** — exibe similaridade, nota, classificação, feedback, os termos de maior peso do
   gabarito, os termos ausentes na descrição criada e os textos já pré-processados.

### Exemplo real (executado pelos testes)

| Caso                                      | Similaridade | Nota   | Feedback     |
| ----------------------------------------- | ------------ | ------ | ------------ |
| Descrição semelhante ao modelo            | 83.5%        | 84/100 | Entendeu     |
| Descrição de outra área (Chef de Cozinha) | 5.5%         | 6/100  | Não entendeu |
| Mesmo contexto com sinônimos              | 1.2%         | 1/100  | Não entendeu |

---

## Testes

`tests/testes-pln.ts` (TypeScript) e `python/testes.py` (Python) executam os três testes
obrigatórios:

- **Teste 1:** descrição semelhante ao modelo → alta similaridade.
- **Teste 2:** descrição de área diferente → baixa similaridade.
- **Teste 3:** mesmo contexto com palavras diferentes → baixa similaridade, evidenciando a
  limitação do TF-IDF.

---

## Limitações do sistema

- **O TF-IDF não entende significado.** Ele compara palavras literais; sinônimos como
  "programadora" e "desenvolvedor" são tratados como termos distintos (Teste 3).
- **Sem lematização/stemming.** "desenvolver", "desenvolvimento" e "desenvolvedor" contam como
  palavras diferentes.
- **Sensível ao tamanho do texto.** Descrições muito curtas tendem a pontuar baixo.
- **Depende da qualidade do gabarito.** Um modelo mal escrito distorce a nota.
- **Não avalia coerência, gramática ou viés** da redação da vaga.
- **Evolução possível:** embeddings semânticos (Word2Vec, BERT/Sentence-Transformers) para
  comparar significado, e não apenas palavras.
