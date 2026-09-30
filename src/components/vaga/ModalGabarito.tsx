/**
 * Abre a janela para criar ou editar um gabarito, que é o texto de referência
 * usado na avaliação. Guarda o texto enquanto a pessoa edita e só permite
 * salvar quando ele tem pelo menos 20 caracteres.
 */
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CriadorGabarito } from "./CriadorGabarito";

interface ModalGabaritoProps {
  readonly aberto: boolean;
  readonly modo: "create" | "edit";
  readonly textoInicial?: string;
  readonly onOpenChange: (aberto: boolean) => void;
  readonly onSalvar: (texto: string) => void;
}

export function ModalGabarito({
  aberto,
  modo,
  textoInicial = "",
  onOpenChange,
  onSalvar,
}: ModalGabaritoProps) {
  const titulo = modo === "create" ? "Criar novo gabarito" : "Editar gabarito";
  const [textoAtual, setTextoAtual] = useState(textoInicial);

  // Ao abrir o formulário, começa com o texto inicial recebido do arquivo que o chamou.
  useEffect(() => {
    if (aberto) setTextoAtual(textoInicial);
  }, [aberto, textoInicial]);

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>
            Preencha os campos usados como referência na avaliação.
          </DialogDescription>
        </DialogHeader>
        <CriadorGabarito textoInicial={textoInicial} onChange={setTextoAtual} />
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={textoAtual.trim().length < 20}
            onClick={() => {
              // Envia o texto para quem abriu a janela e fecha o formulário.
              onSalvar(textoAtual);
              onOpenChange(false);
            }}
          >
            Salvar gabarito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
