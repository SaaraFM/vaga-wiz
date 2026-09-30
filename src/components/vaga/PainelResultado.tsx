import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BookMarked, BrainCircuit, ClipboardCopy, FileDown, Gauge, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { evaluateDescription } from "@/lib/nlp";
import { evaluateWithGemini, type GeminiEvaluation } from "@/lib/nlp/gemini";
import { sugerirGabarito } from "@/lib/vagas/gabaritos";
import { encontrarGabarito, type CustomTemplate, type SelectedTemplate } from "@/lib/vagas/modelos";
import type { RespostasVaga } from "@/lib/vagas/perguntas";
import { gerarRelatorioPdf } from "@/lib/vagas/relatorio";

interface PainelResultadoProps {
  readonly respostas: RespostasVaga;
  readonly descricao: string;
  readonly selecao: SelectedTemplate;
  readonly gabaritosCustomizados: readonly CustomTemplate[];
  readonly seletor: ReactNode;
  readonly onCorrigirNivel: () => void;
  readonly onDescricaoCorrigida: (descricao: string) => void;
}

const CORES_FEEDBACK: Record<string, string> = {
  entendeu: "bg-success text-success-foreground",
  parcial: "bg-warning text-warning-foreground",
  "nao-entendeu": "bg-destructive text-destructive-foreground",
};

/** Remove acentos e padroniza caixa para comparar cargo e nível. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Avisa quando o nível citado no cargo diverge do nível informado na entrevista. */
function detectarInconsistencia(cargo: string, nivel: string): string | null {
  const cargoNormalizado = normalizar(cargo);
  const nivelNormalizado = normalizar(nivel);
  const niveis = [
    { texto: "Júnior", normalizado: "junior" },
    { texto: "Pleno", normalizado: "pleno" },
    { texto: "Sênior", normalizado: "senior" },
  ];
  const nivelNoCargo = niveis.find((item) => cargoNormalizado.includes(item.normalizado));
  if (!nivelNoCargo || !nivelNormalizado.includes(nivelNoCargo.normalizado))
    return nivelNoCargo?.texto ?? null;
  return null;
}

/** Apresenta a descrição gerada, compara com o gabarito e oferece ações de resultado. */
export function PainelResultado({
  respostas,
  descricao,
  selecao,
  gabaritosCustomizados,
  seletor,
  onCorrigirNivel,
  onDescricaoCorrigida,
}: PainelResultadoProps) {
  // Exibe a avaliação local por TF-IDF; o Gemini é uma opção adicional de correção.
  const gabaritoSugerido = useMemo(
    () => sugerirGabarito(respostas.cargo, respostas.area),
    [respostas.cargo, respostas.area],
  );
  const gabaritoEmUso = encontrarGabarito(selecao, gabaritosCustomizados, gabaritoSugerido);
  const origemGabarito =
    selecao.source === "automatic"
      ? "sugerido automaticamente para o cargo"
      : selecao.source === "custom"
        ? "definido por você"
        : "escolhido no banco";

  const avaliacao = useMemo(() => {
    if (gabaritoEmUso.descricao.trim().length < 20) return null;
    return evaluateDescription(descricao, gabaritoEmUso.descricao);
  }, [descricao, gabaritoEmUso]);

  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [mostrarAviso, setMostrarAviso] = useState(true);
  const [avaliacaoGemini, setAvaliacaoGemini] = useState<GeminiEvaluation | null>(null);
  const [descricaoAntesGemini, setDescricaoAntesGemini] = useState<string | null>(null);
  const [avaliandoGemini, setAvaliandoGemini] = useState(false);
  const [erroGemini, setErroGemini] = useState<string | null>(null);

  useEffect(() => {
    setAvaliacaoGemini(null);
    setDescricaoAntesGemini(null);
    setErroGemini(null);
  }, [gabaritoEmUso.descricao]);

  /** Solicita a correção ao Gemini e atualiza a descrição se a resposta for válida. */
  async function avaliarComGemini() {
    setAvaliandoGemini(true);
    setErroGemini(null);
    try {
      const descricaoOriginal = descricao;
      const resultado = await evaluateWithGemini(descricao, gabaritoEmUso.descricao);
      setDescricaoAntesGemini(descricaoOriginal);
      setAvaliacaoGemini(resultado);
      onDescricaoCorrigida(resultado.revisedDescription);
    } catch (error) {
      setErroGemini(error instanceof Error ? error.message : "Não foi possível avaliar com Gemini.");
    } finally {
      setAvaliandoGemini(false);
    }
  }

  /** Copia a descrição atual para a área de transferência. */
  async function copiarDescricao() {
    await navigator.clipboard.writeText(descricao);
    toast.success("Descrição copiada para a área de transferência.");
  }

  /** Gera e baixa um PDF com a descrição e a avaliação atual. */
  async function baixarRelatorio() {
    setGerandoPdf(true);
    try {
      await gerarRelatorioPdf({
        respostas,
        descricao,
        avaliacao,
        nomeGabarito: gabaritoEmUso.nome,
      });
      toast.success("Relatório em PDF gerado.");
    } catch {
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setGerandoPdf(false);
    }
  }

  return (
    <section aria-label="Resultado" className="flex min-w-0 flex-col gap-6">
      <article className="order-2 min-w-0 rounded-2xl border border-border bg-card p-5 shadow-xl sm:p-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="h-5 w-1 rounded-full bg-primary" aria-hidden />
            Descrição
          </h2>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={copiarDescricao}
            >
              <ClipboardCopy className="size-4" aria-hidden />
              Copiar
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-2"
              onClick={baixarRelatorio}
              disabled={gerandoPdf}
            >
              {gerandoPdf ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <FileDown className="size-4" aria-hidden />
              )}
              Relatório PDF
            </Button>
          </div>
        </header>
        <pre className="max-w-full whitespace-pre-wrap wrap-break-word font-sans text-sm leading-relaxed text-foreground">
          {descricao}
        </pre>
      </article>

      <article className="order-1 rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
        <h2 className="mb-5 flex items-center gap-2 font-display text-xs font-bold uppercase text-muted-foreground">
          <Gauge className="size-4 text-primary" aria-hidden />
          Avaliação por PLN (TF-IDF + similaridade do cosseno)
        </h2>

        <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <BookMarked className="size-4 shrink-0 text-primary" aria-hidden />
          <span>
            <strong className="text-foreground">{gabaritoEmUso.nome}</strong>, {origemGabarito}
          </span>
        </p>
        <div className="mb-5">{seletor}</div>

        <div className="mb-5 rounded-xl border border-border bg-surface/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <BrainCircuit className="size-4 text-primary" aria-hidden />
                Corrigir com Gemini
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Avalia e atualiza a descrição automaticamente com base no gabarito.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={avaliarComGemini}
              disabled={avaliandoGemini || !import.meta.env["GEMINI_API_URL"]}
            >
              {avaliandoGemini ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <BrainCircuit className="size-4" aria-hidden />
              )}
              {avaliandoGemini ? "Corrigindo vaga…" : "Corrigir automaticamente"}
            </Button>
          </div>
          {!import.meta.env["GEMINI_API_URL"] && (
            <p className="mt-3 text-xs text-muted-foreground">
              Integração pendente: configure a URL do Worker Gemini para habilitar esta avaliação.
            </p>
          )}
          {erroGemini && (
            <p role="alert" className="mt-3 text-sm text-destructive">{erroGemini}</p>
          )}
          {avaliacaoGemini && (
            <div className="mt-4 rounded-lg border border-border bg-background p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn("mb-2", CORES_FEEDBACK[avaliacaoGemini.verdict === "nao_entendeu" ? "nao-entendeu" : avaliacaoGemini.verdict])}>
                  {avaliacaoGemini.verdict === "entendeu"
                    ? "Entendeu"
                    : avaliacaoGemini.verdict === "parcial"
                      ? "Parcial"
                      : "Não entendeu"}
                </Badge>
                <span className="mb-2 text-sm font-semibold text-foreground">
                  Nota antes da correção: {avaliacaoGemini.score}/100
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{avaliacaoGemini.feedback}</p>
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-3 text-sm font-semibold text-foreground">O que o Gemini corrigiu</p>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="min-w-0 rounded-md border border-border bg-surface/50 p-3">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">ANTES</p>
                    <p className="max-h-72 overflow-y-auto whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-foreground">
                      {descricaoAntesGemini}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-md border border-primary/40 bg-primary/5 p-3">
                    <p className="mb-2 text-xs font-semibold text-primary">DEPOIS · DESCRIÇÃO CORRIGIDA</p>
                    <p className="max-h-72 overflow-y-auto whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-foreground">
                      {avaliacaoGemini.revisedDescription}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  A descrição principal foi atualizada. A nota e o feedback acima avaliam o texto original.
                </p>
              </div>
            </div>
          )}
        </div>

        {mostrarAviso && detectarInconsistencia(respostas.cargo, respostas.nivel) && (
          <div className="mb-5 rounded-xl border border-warning/60 bg-warning/10 p-4 text-sm">
            <p className="font-medium text-foreground">
              Possível inconsistência: o cargo informado contém “
              {detectarInconsistencia(respostas.cargo, respostas.nivel)}”, mas o nível selecionado
              foi “{respostas.nivel}”.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMostrarAviso(false)}
              >
                Manter assim
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={onCorrigirNivel}>
                Corrigir/alterar resposta
              </Button>
            </div>
          </div>
        )}

        {avaliacao ? (
          <div className="mt-6 space-y-5">
            <div className="grid min-w-0 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(9rem,0.9fr)_minmax(0,1fr)]">
              <Metrica
                rotulo="Similaridade técnica"
                valor={`${(avaliacao.similarity * 100).toFixed(1)}%`}
              />
              <RingNota valor={avaliacao.score} />
              <Metrica rotulo="Classificação" valor={avaliacao.classification.label} />
            </div>

            <Progress value={avaliacao.score} aria-label="Aderência ao gabarito" />

            <div className="rounded-xl bg-surface p-4">
              <Badge className={cn("mb-2", CORES_FEEDBACK[avaliacao.feedback.level])}>
                {avaliacao.feedback.label}
              </Badge>
              <p className="text-sm leading-relaxed text-foreground">
                {avaliacao.feedback.message}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ListaTermos
                titulo="Termos de maior peso no gabarito"
                itens={avaliacao.topExpectedTerms.map((t) => t.term)}
              />
              <ListaTermos
                titulo="Termos do gabarito ausentes na sua vaga"
                itens={avaliacao.missingTerms}
                vazio="Nenhum termo relevante ficou de fora."
              />
            </div>

            <details className="rounded-xl border border-border p-4 text-sm">
              <summary className="cursor-pointer font-medium">Ver textos pré-processados</summary>
              <div className="mt-3 space-y-3 text-xs text-muted-foreground">
                <p>
                  <strong className="text-foreground">Sua descrição:</strong>{" "}
                  {avaliacao.cleanedGenerated}
                </p>
                <p>
                  <strong className="text-foreground">Gabarito:</strong> {avaliacao.cleanedExpected}
                </p>
              </div>
            </details>
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">
            Informe uma descrição ideal com pelo menos 20 caracteres para calcular a avaliação.
          </p>
        )}
      </article>
    </section>
  );
}

/** Apresenta um indicador textual, como similaridade ou nota. */
function Metrica({ rotulo, valor }: { readonly rotulo: string; readonly valor: string }) {
  return (
    <div className="flex min-h-32 flex-col justify-center rounded-xl border border-border bg-background px-5 py-4">
      <p className="text-xs text-muted-foreground">{rotulo}</p>
      <p className="mt-1 font-display text-xl font-bold text-foreground">{valor}</p>
    </div>
  );
}

/** Desenha a nota percentual em formato de anel de progresso. */
function RingNota({ valor }: { readonly valor: number }) {
  const nota = Math.min(Math.max(valor, 0), 100);

  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-border bg-background px-4 py-4 text-center">
      <div className="grid size-20 shrink-0 place-items-center">
        <svg
          viewBox="0 0 100 100"
          className="col-start-1 row-start-1 size-full -rotate-90"
          role="img"
          aria-label={`Nota ${Math.round(nota)} por cento`}
        >
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            strokeWidth="8"
            className="stroke-muted-foreground/30"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${nota} ${100 - nota}`}
            className="stroke-primary transition-[stroke-dasharray] duration-700 motion-reduce:transition-none"
          />
        </svg>
        <p className="col-start-1 row-start-1 font-display text-xl font-bold leading-none text-foreground">
          {Math.round(nota)}%
        </p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Aderência ao gabarito</p>
    </div>
  );
}

/** Exibe os termos relevantes ou ausentes que ajudam a explicar a comparação. */
function ListaTermos({
  titulo,
  itens,
  vazio = "Sem dados.",
}: {
  readonly titulo: string;
  readonly itens: readonly string[];
  readonly vazio?: string;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium text-muted-foreground">{titulo}</h3>
      {itens.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {itens.map((termo) => (
            <li
              key={termo}
              className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground"
            >
              {termo}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">{vazio}</p>
      )}
    </div>
  );
}
