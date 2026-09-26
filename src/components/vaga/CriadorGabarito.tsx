import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CampoGabarito =
  "titulo" | "resumo" | "responsabilidades" | "requisitos" | "tecnologias" | "beneficios";

interface DefinicaoCampo {
  readonly id: CampoGabarito;
  readonly rotulo: string;
  readonly placeholder: string;
  readonly multilinha: boolean;
}

const CAMPOS: readonly DefinicaoCampo[] = [
  {
    id: "titulo",
    rotulo: "Título da vaga",
    placeholder: "Desenvolvedor Python Júnior",
    multilinha: false,
  },
  {
    id: "resumo",
    rotulo: "Resumo",
    placeholder: "Buscamos profissional para desenvolver APIs...",
    multilinha: true,
  },
  {
    id: "responsabilidades",
    rotulo: "Responsabilidades",
    placeholder: "Desenvolver APIs, revisar código, escrever testes",
    multilinha: true,
  },
  {
    id: "requisitos",
    rotulo: "Requisitos",
    placeholder: "Python, lógica de programação, Git",
    multilinha: true,
  },
  {
    id: "tecnologias",
    rotulo: "Tecnologias",
    placeholder: "Python, Django, PostgreSQL",
    multilinha: false,
  },
  {
    id: "beneficios",
    rotulo: "Benefícios",
    placeholder: "Vale-refeição, plano de saúde, home office",
    multilinha: false,
  },
];

const VAZIO: Record<CampoGabarito, string> = {
  titulo: "",
  resumo: "",
  responsabilidades: "",
  requisitos: "",
  tecnologias: "",
  beneficios: "",
};

function montarTexto(valores: Record<CampoGabarito, string>): string {
  return CAMPOS.filter((campo) => valores[campo.id].trim())
    .map((campo) => `${campo.rotulo}: ${valores[campo.id].trim()}`)
    .join("\n");
}

function desmontarTexto(texto: string): Record<CampoGabarito, string> {
  const valores = { ...VAZIO };
  for (const linha of texto.split("\n")) {
    const campo = CAMPOS.find((c) => linha.startsWith(`${c.rotulo}: `));
    if (campo) valores[campo.id] = linha.slice(campo.rotulo.length + 2);
  }
  return valores;
}

interface CriadorGabaritoProps {
  readonly onChange: (texto: string) => void;
  readonly textoInicial?: string;
}

export function CriadorGabarito({ onChange, textoInicial = "" }: CriadorGabaritoProps) {
  const [valores, setValores] = useState(() =>
    textoInicial.trim() ? desmontarTexto(textoInicial) : VAZIO,
  );

  useEffect(() => {
    onChange(montarTexto(valores));
  }, [valores, onChange]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Preencha os campos e o sistema monta o gabarito automaticamente.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {CAMPOS.map((campo) => {
          const id = `gabarito-${campo.id}`;
          const props = {
            id,
            value: valores[campo.id],
            placeholder: campo.placeholder,
            onChange: (event: { target: { value: string } }) =>
              setValores((atual) => ({ ...atual, [campo.id]: event.target.value })),
          };
          return (
            <div key={campo.id} className={campo.multilinha ? "sm:col-span-2" : undefined}>
              <label htmlFor={id} className="mb-1 block text-xs font-medium text-foreground">
                {campo.rotulo}
              </label>
              {campo.multilinha ? (
                <Textarea rows={2} className="resize-none" {...props} />
              ) : (
                <Input {...props} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
