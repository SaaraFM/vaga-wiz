import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GABARITOS } from "@/lib/vagas/gabaritos";
import type { CustomTemplate, SelectedTemplate } from "@/lib/vagas/modelos";
import { tituloDoGabarito } from "@/lib/vagas/modelos";

interface SeletorGabaritoProps {
  readonly selecao: SelectedTemplate;
  readonly gabaritosCustomizados: readonly CustomTemplate[];
  readonly gabaritoAutomaticoId: string;
  readonly onChange: (selecao: SelectedTemplate) => void;
  readonly onCriar: () => void;
  readonly onEditar: (gabarito: CustomTemplate) => void;
  readonly onExcluir: (gabarito: CustomTemplate) => void;
}

export function SeletorGabarito({
  selecao,
  gabaritosCustomizados,
  gabaritoAutomaticoId,
  onChange,
  onCriar,
  onEditar,
  onExcluir,
}: SeletorGabaritoProps) {
  const valor = selecao.source === "automatic" ? "automatic" : `${selecao.source}:${selecao.id}`;
  const gabaritoSelecionado =
    selecao.source === "custom"
      ? gabaritosCustomizados.find((item) => item.id === selecao.id)
      : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor="seletor-gabarito" className="block text-xs font-medium text-muted-foreground">
        Avaliar usando
      </label>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Select
          value={valor}
          onValueChange={(novoValor) => {
            if (novoValor === "create") {
              onCriar();
              return;
            }
            const [source, id] = novoValor.split(":");
            if (source === "automatic") onChange({ id: null, source: "automatic" });
            else if (source === "system" && id) onChange({ id, source: "system" });
            else if (source === "custom" && id) onChange({ id, source: "custom" });
          }}
        >
          <SelectTrigger id="seletor-gabarito" className="min-w-0 flex-1 rounded-lg bg-background">
            <SelectValue placeholder="Selecione um gabarito" />
          </SelectTrigger>
          <SelectContent position="item-aligned" className="max-h-80 min-w-[18rem]">
            <SelectItem value="automatic">Automático conforme o cargo</SelectItem>
            {gabaritosCustomizados.length > 0 && (
              <SelectGroup>
                <SelectLabel>Meus gabaritos</SelectLabel>
                {gabaritosCustomizados.map((gabarito) => (
                  <SelectItem key={gabarito.id} value={`custom:${gabarito.id}`}>
                    {tituloDoGabarito(gabarito.texto)}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Banco de gabaritos</SelectLabel>
              {GABARITOS.map((gabarito) => (
                <SelectItem key={gabarito.id} value={`system:${gabarito.id}`}>
                  {gabarito.cargo}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectItem value="create">
              <span className="flex items-center gap-2 font-medium text-primary">
                <Plus className="size-4" aria-hidden />
                Criar novo gabarito
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        {gabaritoSelecionado && (
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onEditar(gabaritoSelecionado)}
              aria-label="Editar gabarito"
            >
              <Pencil className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onExcluir(gabaritoSelecionado)}
              aria-label="Excluir gabarito"
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <p className="min-w-0 flex-1 text-xs text-muted-foreground">
          {selecao.source === "automatic"
            ? `Sugestão atual: ${GABARITOS.find((item) => item.id === gabaritoAutomaticoId)?.cargo ?? "cargo informado"}`
            : selecao.source === "custom"
              ? "Gabarito criado por você"
              : "Gabarito padrão do sistema"}
        </p>
      </div>
    </div>
  );
}
