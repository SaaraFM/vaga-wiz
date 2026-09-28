import { GABARITOS, type Gabarito } from "./gabaritos";

export type TemplateSource = "automatic" | "system" | "custom";

export interface SelectedTemplate {
  readonly id: string | null;
  readonly source: TemplateSource;
}

export interface CustomTemplate {
  readonly id: string;
  readonly texto: string;
}

export const TEMPLATE_AUTOMATICO: SelectedTemplate = { id: null, source: "automatic" };
export const CHAVE_GABARITOS_CUSTOMIZADOS = "vaga-wiz:gabaritos-customizados";

export function tituloDoGabarito(texto: string): string {
  const titulo = texto.match(/^Título da vaga:\s*(.+)$/m)?.[1]?.trim();
  return titulo || "Gabarito sem título";
}

export function criarIdGabarito(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function encontrarGabarito(
  selecao: SelectedTemplate,
  gabaritosCustomizados: readonly CustomTemplate[],
  gabaritoAutomatico: Gabarito,
): { readonly nome: string; readonly descricao: string } {
  if (selecao.source === "automatic") {
    return { nome: `Automático: ${gabaritoAutomatico.cargo}`, descricao: gabaritoAutomatico.descricao };
  }

  if (selecao.source === "custom") {
    const gabarito = gabaritosCustomizados.find((item) => item.id === selecao.id);
    if (gabarito) return { nome: tituloDoGabarito(gabarito.texto), descricao: gabarito.texto };
  }

  const gabaritoSistema = GABARITOS.find((item) => item.id === selecao.id);
  return gabaritoSistema
    ? { nome: gabaritoSistema.cargo, descricao: gabaritoSistema.descricao }
    : { nome: `Automático: ${gabaritoAutomatico.cargo}`, descricao: gabaritoAutomatico.descricao };
}