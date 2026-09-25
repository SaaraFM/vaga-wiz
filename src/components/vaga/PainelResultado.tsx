import { useMemo, useState } from "react";
import { Check, ClipboardCopy, FileDown, FileText, Gauge, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { evaluateDescription } from "@/lib/nlp";
import { GABARITOS, sugerirGabarito } from "@/lib/vagas/gabaritos";
import type { RespostasVaga } from "@/lib/vagas/perguntas";
import { gerarRelatorioPdf } from "@/lib/vagas/relatorio";

interface PainelResultadoProps {
  readonly respostas: RespostasVaga;
  readonly descricao: string;
}

const CORES_FEEDBACK: Record<string, string> = {
  entendeu: "bg-success text-success-foreground",
  parcial: "bg-warning text-warning-foreground",
  "nao-entendeu": "bg-destructive text-destructive-foreground",
};

export function PainelResultado({ respostas, descricao }: PainelResultadoProps) {
  const gabaritoSugerido = useMemo(
    () => sugerirGabarito(respostas.cargo, respostas.area),
    [respostas.cargo, respostas.area],
  );

  const [gabaritoId, setGabaritoId] = useState(gabaritoSugerido.id);
  const [gabaritoProprio, setGabaritoProprio] = useState("");
  const [usarProprio, setUsarProprio] = useState(false);

  const textoGabarito = usarProprio
    ? gabaritoProprio
    : (GABARITOS.find((g) => g.id === gabaritoId) ?? gabaritoSugerido).descricao;

  const avaliacao = useMemo(() => {
    if (textoGabarito.trim().length < 20) return null;
    return evaluateDescription(descricao, textoGabarito);
  }, [descricao, textoGabarito]);

  const [gerandoPdf, setGerandoPdf] = useState(false);

  async function copiarDescricao() {
    await navigator.clipboard.writeText(descricao);
    toast.success("Descrição copiada para a área de transferência.");
  }

  async function baixarRelatorio() {
    setGerandoPdf(true);
    try {
      await gerarRelatorioPdf({
        respostas,
        descricao,
        avaliacao,
        nomeGabarito: usarProprio
          ? "Gabarito próprio"
          : (GABARITOS.find((g) => g.id === gabaritoId) ?? gabaritoSugerido).cargo,
      });
      toast.success("Relatório em PDF gerado.");
    } catch {
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setGerandoPdf(false);
    }
  }

  return (
    <section aria-label="Resultado" className="flex h-full flex-col gap-4">
      <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="size-4 text-primary" aria-hidden />
            Descrição gerada
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
        <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl bg-surface p-4 font-sans text-sm leading-relaxed text-foreground">
          {descricao}
        </pre>
      </article>

      <article className="flex-1 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Gauge className="size-4 text-primary" aria-hidden />
          Avaliação por PLN (TF-IDF + similaridade do cosseno)
        </h2>

        <Tabs
          value={usarProprio ? "proprio" : "banco"}
          onValueChange={(valor) => setUsarProprio(valor === "proprio")}
        >
          <TabsList className="mb-3">
            <TabsTrigger value="banco">Banco de gabaritos</TabsTrigger>
            <TabsTrigger value="proprio">Gabarito próprio</TabsTrigger>
          </TabsList>

          <TabsContent value="banco">
            <div className="flex flex-wrap gap-2">
              {GABARITOS.map((gabarito) => {
                const ativo = gabarito.id === gabaritoId;
                return (
                  <button
                    key={gabarito.id}
                    type="button"
                    onClick={() => setGabaritoId(gabarito.id)}
                    aria-pressed={ativo}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      ativo
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface text-muted-foreground hover:border-primary hover:text-foreground",
                    )}
                  >
                    {ativo && <Check className="size-3" aria-hidden />}
                    {gabarito.cargo}
                  </button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="proprio">
            <label htmlFor="gabarito-proprio" className="mb-2 block text-xs text-muted-foreground">
              Cole a descrição ideal usada como referência.
            </label>
            <Textarea
              id="gabarito-proprio"
              rows={5}
              value={gabaritoProprio}
              onChange={(event) => setGabaritoProprio(event.target.value)}
              placeholder="Buscamos desenvolvedor Python com experiência em APIs REST, banco de dados..."
              className="resize-none"
            />
          </TabsContent>
        </Tabs>

        {avaliacao ? (
          <div className="mt-5 space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <Metrica
                rotulo="Similaridade"
                valor={`${(avaliacao.similarity * 100).toFixed(1)}%`}
              />
              <Metrica rotulo="Nota" valor={`${avaliacao.score}/100`} />
              <Metrica rotulo="Classificação" valor={avaliacao.classification.label} />
            </div>

            <Progress value={avaliacao.score} aria-label="Nota da descrição" />

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

function Metrica({ rotulo, valor }: { readonly rotulo: string; readonly valor: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <p className="text-xs text-muted-foreground">{rotulo}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{valor}</p>
    </div>
  );
}

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
