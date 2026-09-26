import { useState } from "react";
import { BookMarked, Check, ClipboardList, X } from "lucide-react";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { ChatVaga } from "@/components/vaga/ChatVaga";
import { CriadorGabarito } from "@/components/vaga/CriadorGabarito";
import { PainelResultado } from "@/components/vaga/PainelResultado";
import { gerarDescricao } from "@/lib/vagas/gerador";
import type { RespostasVaga } from "@/lib/vagas/perguntas";

interface EstadoVaga {
  readonly respostas: RespostasVaga;
  readonly descricao: string;
}

export function PaginaVaga() {
  const [vaga, setVaga] = useState<EstadoVaga | null>(null);
  const [gabaritoCriado, setGabaritoCriado] = useState("");
  const [gabaritoConfirmado, setGabaritoConfirmado] = useState("");
  const [criarAberto, setCriarAberto] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />

      <main className="mx-auto grid min-h-screen max-w-7xl items-start gap-6 px-4 py-6 sm:px-6 lg:h-screen lg:grid-cols-[25rem_minmax(0,1fr)] lg:px-8">
        <div className="flex min-h-[38rem] flex-col gap-4 lg:min-h-0 lg:overflow-y-auto">
          <div className="min-h-[38rem] shrink-0 lg:min-h-0">
            <ChatVaga
              onConcluir={(respostas) => setVaga({ respostas, descricao: gerarDescricao(respostas) })}
              onReiniciar={() => setVaga(null)}
            />
          </div>

          {!vaga && (
            <div className="shrink-0 pb-2">
              <div className="mb-3 flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
                <BookMarked className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <p className="text-sm text-muted-foreground">
                  Gabarito em uso:{" "}
                  <strong className="text-foreground">
                    {gabaritoConfirmado
                      ? "Gabarito criado pelo empregador"
                      : "Seleção automática conforme o cargo"}
                  </strong>
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => setCriarAberto((aberto) => !aberto)}
                aria-expanded={criarAberto}
              >
                {criarAberto ? (
                  <X className="size-4" aria-hidden />
                ) : (
                  <ClipboardList className="size-4" aria-hidden />
                )}
                {criarAberto ? "Fechar criador" : "Criar novo gabarito"}
              </Button>

              {criarAberto && (
                <article className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-xl">
                  <h2 className="mb-4 flex items-center gap-3 font-display text-base font-bold">
                    <span className="h-5 w-1.5 rounded-full bg-primary" aria-hidden />
                    Criar novo gabarito
                  </h2>
                  <CriadorGabarito
                    onChange={setGabaritoCriado}
                    textoInicial={gabaritoConfirmado}
                  />
                  <div className="mt-4 flex flex-col gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="w-full gap-2"
                      disabled={gabaritoCriado.trim().length < 20}
                      onClick={() => {
                         setGabaritoConfirmado(gabaritoCriado);
                        setCriarAberto(false);
                        toast.success(
                          "Gabarito salvo. Ele será usado como referência na avaliação ao final da entrevista.",
                        );
                      }}
                    >
                      <Check className="size-4" aria-hidden />
                      Confirmar gabarito
                    </Button>
                    {gabaritoCriado.trim().length < 20 && (
                      <p className="text-xs text-muted-foreground">
                        Preencha os campos (mínimo de 20 caracteres no total) para confirmar.
                      </p>
                    )}
                  </div>
                </article>
              )}
            </div>
          )}
        </div>

        {vaga ? (
          <PainelResultado
            respostas={vaga.respostas}
            descricao={vaga.descricao}
            gabaritoCriadoInicial={gabaritoConfirmado}
          />
        ) : (
          <section
            aria-label="Resultado"
            className="flex min-h-[24rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-8 text-center lg:min-h-0"
          >
            <h2 className="text-base font-semibold text-foreground">Aguardando a entrevista</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Responda às 8 perguntas do chatbot. Ao final, a descrição da vaga e a avaliação de
              qualidade aparecem aqui.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
