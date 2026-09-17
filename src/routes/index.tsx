import { createFileRoute } from "@tanstack/react-router";

import { PaginaVaga } from "@/components/vaga/PaginaVaga";

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
  component: PaginaVaga,
});
