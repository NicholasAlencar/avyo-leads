// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SidebarNav } from "./sidebar-nav";

describe("SidebarNav", () => {
  it("renders product destinations without numbered markers or promotional copy", () => {
    render(<SidebarNav currentPath="/dashboard" />);

    expect(screen.getByRole("link", { name: /visão geral/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /^leads$/i })).toHaveAttribute("href", "/leads");
    expect(screen.getByRole("link", { name: /encontrar empresas/i })).toHaveAttribute("href", "/encontrar");
    expect(screen.getByRole("link", { name: /pipeline/i })).toHaveAttribute("href", "/pipeline");
    expect(screen.getByRole("link", { name: /follow-ups/i })).toHaveAttribute("href", "/follow-ups");
    expect(screen.getByRole("link", { name: /integrações/i })).toHaveAttribute("href", "/configuracoes/integracoes");
    expect(screen.queryByText("01")).not.toBeInTheDocument();
    expect(screen.queryByText(/menos volume/i)).not.toBeInTheDocument();
  });

  it("marks the active destination for assistive technology", () => {
    render(<SidebarNav currentPath="/pipeline" />);

    expect(screen.getByRole("link", { name: /pipeline/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /^leads$/i })).not.toHaveAttribute("aria-current");
  });
});
