import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { PaginaVaga } from "@/components/vaga/PaginaVaga";
import "@/styles.css";

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
    <StrictMode>
      <PaginaVaga />
    </StrictMode>,
  );
}
