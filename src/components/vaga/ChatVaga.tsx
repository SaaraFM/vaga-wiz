import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, RotateCcw, Send, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { PERGUNTAS, RESPOSTAS_VAZIAS, type RespostasVaga } from "@/lib/vagas/perguntas";

interface Mensagem {
  readonly id: string;
  readonly autor: "bot" | "usuario";
  readonly texto: string;
}

interface ChatVagaProps {
  readonly onConcluir: (respostas: RespostasVaga) => void;
  readonly onReiniciar: () => void;
}

const MENSAGEM_INICIAL: Mensagem = {
  id: "inicio",
  autor: "bot",
  texto:
    "Olá! Sou o assistente de vagas. Vou fazer 8 perguntas e montar uma descrição profissional para a sua empresa.",
};

export function ChatVaga({ onConcluir, onReiniciar }: ChatVagaProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    MENSAGEM_INICIAL,
    { id: "p-0", autor: "bot", texto: PERGUNTAS[0]!.texto },
  ]);
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<RespostasVaga>(RESPOSTAS_VAZIAS);
  const [rascunho, setRascunho] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const finalizado = indice >= PERGUNTAS.length;
  const perguntaAtual = PERGUNTAS[indice];
  const fimDaListaRef = useRef<HTMLDivElement>(null);
  const campoRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensagens]);

  useEffect(() => {
    if (!finalizado) campoRef.current?.focus();
  }, [indice, finalizado]);

  function responder(valor: string) {
    const texto = valor.trim();
    if (!perguntaAtual) return;

    if (texto.length < 2) {
      setErro("Escreva uma resposta com pelo menos 2 caracteres.");
      return;
    }

    setErro(null);
    const proximasRespostas: RespostasVaga = { ...respostas, [perguntaAtual.campo]: texto };
    const proximoIndice = indice + 1;
    const proximaPergunta = PERGUNTAS[proximoIndice];

    setRespostas(proximasRespostas);
    setRascunho("");
    setIndice(proximoIndice);
    setMensagens((atuais) => [
      ...atuais,
      { id: `r-${indice}`, autor: "usuario", texto },
      proximaPergunta
        ? { id: `p-${proximoIndice}`, autor: "bot", texto: proximaPergunta.texto }
        : {
            id: "fim",
            autor: "bot",
            texto: "Perfeito! Gerei a descrição da vaga e já comparei com o modelo ideal.",
          },
    ]);

    if (!proximaPergunta) onConcluir(proximasRespostas);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    responder(rascunho);
  }

  function reiniciar() {
    setMensagens([MENSAGEM_INICIAL, { id: "p-0", autor: "bot", texto: PERGUNTAS[0]!.texto }]);
    setIndice(0);
    setRespostas(RESPOSTAS_VAZIAS);
    setRascunho("");
    setErro(null);
    onReiniciar();
  }

  const progresso = Math.round((indice / PERGUNTAS.length) * 100);

  return (
    <section
      aria-label="Chatbot de criação de vaga"
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Bot className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-sm font-semibold">Assistente de vagas</h2>
            <p className="text-xs text-muted-foreground">
              {finalizado
                ? "Entrevista concluída"
                : `Pergunta ${indice + 1} de ${PERGUNTAS.length}`}
            </p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={reiniciar} className="gap-2">
          <RotateCcw className="size-4" aria-hidden />
          Recomeçar
        </Button>
      </header>

      <Progress
        value={progresso}
        className="h-1 rounded-none"
        aria-label="Progresso da entrevista"
      />

      <div
        className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5"
        role="log"
        aria-live="polite"
      >
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={cn(
              "flex items-end gap-2",
              mensagem.autor === "usuario" ? "justify-end" : "justify-start",
            )}
          >
            {mensagem.autor === "bot" && (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Bot className="size-3.5" aria-hidden />
              </span>
            )}
            <p
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed transition-colors",
                mensagem.autor === "usuario"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-bot text-bot-foreground",
              )}
            >
              {mensagem.texto}
            </p>
            {mensagem.autor === "usuario" && (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <User className="size-3.5" aria-hidden />
              </span>
            )}
          </div>
        ))}
        <div ref={fimDaListaRef} />
      </div>

      {perguntaAtual ? (
        <form onSubmit={handleSubmit} className="border-t border-border p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {perguntaAtual.sugestoes.map((sugestao) => (
              <button
                key={sugestao}
                type="button"
                onClick={() => setRascunho(sugestao)}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {sugestao}
              </button>
            ))}
          </div>

          <label htmlFor="resposta" className="sr-only">
            {perguntaAtual.rotulo}
          </label>
          <Textarea
            id="resposta"
            ref={campoRef}
            value={rascunho}
            onChange={(event) => setRascunho(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                responder(rascunho);
              }
            }}
            placeholder={perguntaAtual.placeholder}
            rows={3}
            aria-invalid={erro !== null}
            aria-describedby={erro ? "erro-resposta" : undefined}
            className="resize-none"
          />
          {erro && (
            <p id="erro-resposta" className="mt-2 text-xs text-destructive">
              {erro}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              Enter envia • Shift+Enter quebra linha
            </span>
            <Button type="submit" size="sm" className="gap-2" disabled={rascunho.trim().length < 2}>
              Enviar
              <Send className="size-4" aria-hidden />
            </Button>
          </div>
        </form>
      ) : (
        <div className="border-t border-border p-4 text-sm text-muted-foreground sm:p-5">
          Entrevista concluída. Veja a descrição e a avaliação ao lado.
        </div>
      )}
    </section>
  );
}
