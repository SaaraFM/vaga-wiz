import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ChatVaga } from "@/components/vaga/ChatVaga";
import { PainelResultado } from "@/components/vaga/PainelResultado";
import { gerarDescricao } from "@/lib/vagas/gerador";
import type { RespostasVaga } from "@/lib/vagas/perguntas";

interface EstadoVaga {
  readonly respostas: RespostasVaga;
  readonly descricao: string;
}

export function PaginaVaga() {
  const [vaga, setVaga] = useState<EstadoVaga | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />

      <main className="mx-auto grid min-h-screen max-w-7xl items-stretch gap-6 px-4 py-6 sm:px-6 lg:h-screen lg:grid-cols-[25rem_minmax(0,1fr)] lg:px-8">
        <div className="min-h-[38rem] lg:min-h-0">
          <ChatVaga
            onConcluir={(respostas) => setVaga({ respostas, descricao: gerarDescricao(respostas) })}
            onReiniciar={() => setVaga(null)}
          />
        </div>

        {vaga ? (
          <PainelResultado respostas={vaga.respostas} descricao={vaga.descricao} />
        ) : (
          <section
            aria-label="Resultado"
            className="flex min-h-[38rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-8 text-center lg:min-h-0"
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
