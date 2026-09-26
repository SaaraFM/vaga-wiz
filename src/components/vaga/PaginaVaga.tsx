import { useState } from "react";
import { ClipboardList, X } from "lucide-react";

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
  const [criarAberto, setCriarAberto] = useState(false);

  const botaoCriar = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2"
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
  );

  const painelCriador = criarAberto && (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
      <h2 className="mb-4 flex items-center gap-3 font-display text-lg font-bold">
        <span className="h-5 w-1.5 rounded-full bg-primary" aria-hidden />
        Criar novo gabarito
      </h2>
      <CriadorGabarito onChange={setGabaritoCriado} />
      {gabaritoCriado.trim().length >= 20 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Gabarito pronto. Ele será usado como referência na avaliação ao final da entrevista.
        </p>
      )}
    </article>
  );

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />

      <main className="mx-auto grid min-h-screen max-w-7xl items-stretch gap-6 px-4 py-6 sm:px-6 lg:h-screen lg:grid-cols-[25rem_minmax(0,1fr)] lg:px-8">
        <div className="flex min-h-[38rem] flex-col gap-6 lg:min-h-0 lg:overflow-y-auto">
          <div className="min-h-[38rem] shrink-0 lg:min-h-0">
            <ChatVaga
              onConcluir={(respostas) => setVaga({ respostas, descricao: gerarDescricao(respostas) })}
              onReiniciar={() => setVaga(null)}
            />
          </div>
          {!vaga && (
            <div className="shrink-0">
              {botaoCriar}
              {criarAberto && <div className="mt-4">{painelCriador}</div>}
            </div>
          )}
        </div>

        {vaga ? (
          <PainelResultado
            respostas={vaga.respostas}
            descricao={vaga.descricao}
            gabaritoCriadoInicial={gabaritoCriado}
          />
        ) : (
          <section
            aria-label="Resultado"
            className="flex min-h-[38rem] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card p-8 text-center lg:min-h-0"
          >
            <h2 className="text-base font-semibold text-foreground">Aguardando a entrevista</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Responda às 8 perguntas do chatbot. Ao final, a descrição da vaga e a avaliação de
              qualidade aparecem aqui.
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Se preferir, crie agora o gabarito de referência usado na avaliação:
            </p>
            {botaoCriar}
            {criarAberto && <div className="w-full max-w-2xl text-left">{painelCriador}</div>}
          </section>
        )}
      </main>
    </div>
  );
}
