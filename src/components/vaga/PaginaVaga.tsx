import { useEffect, useState } from "react";
import { BookMarked } from "lucide-react";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { ChatVaga } from "@/components/vaga/ChatVaga";
import { ModalGabarito } from "@/components/vaga/ModalGabarito";
import { PainelResultado } from "@/components/vaga/PainelResultado";
import { SeletorGabarito } from "@/components/vaga/SeletorGabarito";
import { gerarDescricao } from "@/lib/vagas/gerador";
import { sugerirGabarito } from "@/lib/vagas/gabaritos";
import {
  CHAVE_GABARITOS_CUSTOMIZADOS,
  criarIdGabarito,
  TEMPLATE_AUTOMATICO,
  type CustomTemplate,
  type SelectedTemplate,
} from "@/lib/vagas/modelos";
import type { RespostasVaga } from "@/lib/vagas/perguntas";

interface EstadoVaga {
  readonly respostas: RespostasVaga;
  readonly descricao: string;
}

/** Controla a criação da vaga e conecta entrevista, gabaritos e painel de resultado. */
export function PaginaVaga() {
  // Coordena os componentes e mantém o estado da vaga durante o fluxo da aplicação.
  const [vaga, setVaga] = useState<EstadoVaga | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const [selecao, setSelecao] = useState<SelectedTemplate>(TEMPLATE_AUTOMATICO);
  const [gabaritosCustomizados, setGabaritosCustomizados] = useState<CustomTemplate[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const salvo = window.localStorage.getItem(CHAVE_GABARITOS_CUSTOMIZADOS);
      const parsed = salvo ? (JSON.parse(salvo) as unknown) : [];
      return Array.isArray(parsed)
        ? parsed.filter((item): item is CustomTemplate =>
            Boolean(
              item &&
              typeof item === "object" &&
              "id" in item &&
              "texto" in item &&
              typeof item.id === "string" &&
              typeof item.texto === "string",
            ),
          )
        : [];
    } catch {
      return [];
    }
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState<"create" | "edit">("create");
  const [gabaritoEditando, setGabaritoEditando] = useState<CustomTemplate | null>(null);

  // Salva os gabaritos personalizados no navegador para que continuem disponíveis depois.
  useEffect(() => {
    window.localStorage.setItem(
      CHAVE_GABARITOS_CUSTOMIZADOS,
      JSON.stringify(gabaritosCustomizados),
    );
  }, [gabaritosCustomizados]);

  const gabaritoAutomatico = sugerirGabarito(
    vaga?.respostas.cargo ?? "",
    vaga?.respostas.area ?? "",
  );

  /** Abre o formulário para cadastrar um novo gabarito personalizado. */
  function abrirCriacao() {
    setModoModal("create");
    setGabaritoEditando(null);
    setModalAberto(true);
  }

  /** Prepara o modal com o gabarito selecionado para edição. */
  function abrirEdicao(gabarito: CustomTemplate) {
    setModoModal("edit");
    setGabaritoEditando(gabarito);
    setModalAberto(true);
  }

  /** Cria ou atualiza um gabarito e o define como a referência em uso. */
  function salvarGabarito(texto: string) {
    if (modoModal === "edit" && gabaritoEditando) {
      setGabaritosCustomizados((atuais) =>
        atuais.map((item) => (item.id === gabaritoEditando.id ? { ...item, texto } : item)),
      );
      setSelecao({ id: gabaritoEditando.id, source: "custom" });
      toast.success("Gabarito atualizado.");
      return;
    }

    const novo = { id: criarIdGabarito(), texto };
    setGabaritosCustomizados((atuais) => [...atuais, novo]);
    setSelecao({ id: novo.id, source: "custom" });
    toast.success("Gabarito salvo.");
  }

  /** Confirma a exclusão e volta à sugestão automática se necessário. */
  function excluirGabarito(gabarito: CustomTemplate) {
    if (!window.confirm("Excluir este gabarito personalizado?")) return;
    setGabaritosCustomizados((atuais) => atuais.filter((item) => item.id !== gabarito.id));
    if (selecao.source === "custom" && selecao.id === gabarito.id) setSelecao(TEMPLATE_AUTOMATICO);
    toast.success("Gabarito excluído.");
  }

  const seletor = (
    <SeletorGabarito
      selecao={selecao}
      gabaritosCustomizados={gabaritosCustomizados}
      gabaritoAutomaticoId={gabaritoAutomatico.id}
      onChange={setSelecao}
      onCriar={abrirCriacao}
      onEditar={abrirEdicao}
      onExcluir={excluirGabarito}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />

      <main
        className={`mx-auto grid min-h-screen max-w-7xl items-start gap-6 px-4 py-6 sm:px-6 lg:min-h-0 lg:grid-cols-[25rem_minmax(0,1fr)] lg:px-8 ${
          vaga ? "lg:h-auto" : "lg:h-dvh lg:overflow-hidden"
        }`}
      >
        <div className="flex min-w-0 flex-col gap-4 lg:h-full lg:min-h-0 lg:grid lg:grid-rows-[minmax(0,1fr)_auto] lg:overflow-hidden">
          <div className="h-[min(42rem,calc(100dvh-1.5rem))] min-h-0 shrink-0 lg:h-auto">
          <ChatVaga
            key={chatKey}
              onConcluir={(respostas) =>
                setVaga({ respostas, descricao: gerarDescricao(respostas) })
              }
              onReiniciar={() => setVaga(null)}
            />
          </div>

          {!vaga && (
            <div className="shrink-0 rounded-xl border border-border bg-card p-4 shadow-lg">
              <div className="mb-4 flex items-start gap-3">
                <BookMarked className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <p className="text-sm text-muted-foreground">
                  Escolha a referência usada para avaliar a descrição ao final da entrevista.
                </p>
              </div>
              {seletor}
            </div>
          )}
        </div>

        <div className={`min-w-0 ${vaga ? "lg:min-h-0" : "lg:min-h-0 lg:overflow-y-auto"}`}>
          {vaga ? (
            <PainelResultado
              respostas={vaga.respostas}
              descricao={vaga.descricao}
              selecao={selecao}
              gabaritosCustomizados={gabaritosCustomizados}
              seletor={seletor}
              onCorrigirNivel={() => {
                setVaga(null);
                setChatKey((atual) => atual + 1);
                toast.message("Você pode responder novamente à entrevista.");
              }}
              onDescricaoCorrigida={(descricao) => {
                setVaga((atual) => (atual ? { ...atual, descricao } : atual));
                toast.success("O Gemini atualizou automaticamente a descrição da vaga.");
              }}
            />
          ) : (
            <section
              aria-label="Resultado"
              className="flex min-h-96 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-8 text-center lg:min-h-0"
            >
              <h2 className="text-base font-semibold text-foreground">Aguardando a entrevista</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Responda às 8 perguntas do chatbot. Ao final, a descrição da vaga e a avaliação de
                aderência aparecem aqui.
              </p>
            </section>
          )}
        </div>
      </main>
      <ModalGabarito
        aberto={modalAberto}
        modo={modoModal}
        textoInicial={gabaritoEditando?.texto ?? ""}
        onOpenChange={setModalAberto}
        onSalvar={salvarGabarito}
      />
    </div>
  );
}
