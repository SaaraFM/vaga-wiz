import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkle } from "lucide-react";

import { Toaster } from "@/components/ui/sonner";
import { ChatVaga } from "@/components/vaga/ChatVaga";
import { PainelResultado } from "@/components/vaga/PainelResultado";
import { gerarDescricao } from "@/lib/vagas/gerador";
import type { RespostasVaga } from "@/lib/vagas/perguntas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Criador de Descrição de Vagas com PLN" },
      {
        name: "description",
        content:
          "Chatbot que cria descrições de vagas e avalia a qualidade com TF-IDF e similaridade do cosseno.",
      },
      { property: "og:title", content: "Criador de Descrição de Vagas com PLN" },
      {
        property: "og:description",
        content:
          "Gere descrições de vagas por chatbot e receba nota de 0 a 100 com feedback automático.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

interface EstadoVaga {
  readonly respostas: RespostasVaga;
  readonly descricao: string;
}

function Index() {
  const [vaga, setVaga] = useState<EstadoVaga | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />

      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-primary">
            <Sparkle className="size-4" aria-hidden />
            <span className="text-xs font-medium tracking-wide uppercase">
              Processamento de Linguagem Natural
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Criador de Descrição de Vagas
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Converse com o chatbot, gere uma descrição profissional e compare com a descrição ideal
            usando TF-IDF e similaridade do cosseno: similaridade, nota de 0 a 100 e feedback automático.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="min-h-[34rem] lg:h-[calc(100vh-14rem)] lg:sticky lg:top-6">
          <ChatVaga
            onConcluir={(respostas) =>
              setVaga({ respostas, descricao: gerarDescricao(respostas) })
            }
            onReiniciar={() => setVaga(null)}
          />
        </div>

        {vaga ? (
          <PainelResultado respostas={vaga.respostas} descricao={vaga.descricao} />
        ) : (
          <section
            aria-label="Resultado"
            className="flex min-h-[20rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center"
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
