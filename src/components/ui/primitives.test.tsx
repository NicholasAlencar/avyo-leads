// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AvyoLogo } from "./avyo-logo";
import { Badge, Button, EmptyState, IconButton, PageHeading, Surface } from "./primitives";

describe("product UI primitives", () => {
  it("renders the AVYO identity from transparent production assets", () => {
    render(<AvyoLogo variant="light" />);

    const logo = screen.getByRole("img", { name: "AVYO" });
    expect(logo).toHaveAttribute("src", "/brand/avyo-wordmark-light.png");
    expect(logo).toHaveAttribute("width", "455");
    expect(logo).toHaveAttribute("height", "93");
  });

  it("renders typed interaction variants with accessible labels", () => {
    render(
      <div>
        <Button variant="primary">Novo lead</Button>
        <IconButton label="Abrir busca">⌕</IconButton>
        <Badge tone="success">Configurada</Badge>
      </div>,
    );

    expect(screen.getByRole("button", { name: "Novo lead" })).toHaveAttribute("data-variant", "primary");
    expect(screen.getByRole("button", { name: "Abrir busca" })).toBeInTheDocument();
    expect(screen.getByText("Configurada")).toHaveAttribute("data-tone", "success");
  });

  it("composes headings, surfaces, and actionable empty states", () => {
    render(
      <Surface>
        <PageHeading eyebrow="Operação comercial" title="Leads" description="Priorize as melhores oportunidades." />
        <EmptyState title="Nenhum lead" description="Encontre empresas para iniciar." actionHref="/encontrar" actionLabel="Encontrar empresas" />
      </Surface>,
    );

    expect(screen.getByRole("heading", { name: "Leads" })).toBeInTheDocument();
    expect(screen.getByText("Priorize as melhores oportunidades.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Encontrar empresas" })).toHaveAttribute("href", "/encontrar");
  });
});
