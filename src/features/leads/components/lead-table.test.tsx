// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { LeadSummary } from "../types";
import { LeadTable } from "./lead-table";

const leads: LeadSummary[] = [
  {
    id: "4a90b17c-76de-4854-93e7-e172a5952b91",
    companyName: "Clínica Exemplo",
    segment: "Odontologia",
    city: "Mogi das Cruzes",
    stateCode: "SP",
    phone: "(11) 4000-0000",
    email: null,
    websiteUrl: "https://example.com",
    instagramUrl: null,
    linkedinUrl: null,
    pipelineStage: "PRIORITY",
    ownerId: null,
    ownerName: null,
    score: null,
    opportunityReason: null,
    lastActivityAt: null,
    createdAt: "2026-09-03T12:00:00.000Z",
  },
];

describe("LeadTable", () => {
  it("renders persisted fields and honest empty intelligence states", () => {
    render(<LeadTable leads={leads} />);

    expect(screen.getByRole("link", { name: "Clínica Exemplo" })).toHaveAttribute(
      "href",
      `/leads/${leads[0].id}`,
    );
    expect(screen.getByText("Sem score")).toBeInTheDocument();
    expect(screen.getByText("Ainda não analisado")).toBeInTheDocument();
  });

  it("selects visible rows and reports the selection count", () => {
    render(<LeadTable leads={leads} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Selecionar Clínica Exemplo" }));

    expect(screen.getByText("1 selecionado")).toBeInTheDocument();
  });

  it("renders an actionable empty state without sample leads", () => {
    render(<LeadTable leads={[]} />);

    expect(screen.getByText("Nenhum lead encontrado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Adicionar primeiro lead" })).toHaveAttribute(
      "href",
      "/leads/novo",
    );
  });

  it("shows score classification and compact contact availability", () => {
    render(<LeadTable leads={[{ ...leads[0], score: 82, email: "contato@clinica.com.br", instagramUrl: "https://instagram.com/clinica" }]} />);

    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("Muito quente")).toBeInTheDocument();
    expect(screen.getByLabelText("Telefone disponível")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail disponível")).toBeInTheDocument();
    expect(screen.getByLabelText("Instagram disponível")).toBeInTheDocument();
  });
});
