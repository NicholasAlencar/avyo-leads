// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/features/leads/actions", () => ({ changeLeadStageAction: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import { PipelineBoard } from "./pipeline-board";
import type { LeadSummary } from "@/features/leads/types";

const lead: LeadSummary = { id: "lead-1", companyName: "Clínica Horizonte", segment: "Odontologia", city: "Mogi das Cruzes", stateCode: "SP", phone: null, email: null, websiteUrl: null, instagramUrl: null, linkedinUrl: null, pipelineStage: "PRIORITY", ownerId: "owner-1", ownerName: "Nicholas", score: 91, opportunityReason: "Operação multiunidade", lastActivityAt: "2026-09-05T12:00:00.000Z", createdAt: "2026-09-01T12:00:00.000Z" };

describe("PipelineBoard", () => {
  it("renders all stages and a real empty state", () => {
    render(<PipelineBoard leads={[]} />);
    expect(screen.getByRole("heading", { name: "Novo" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cliente" })).toBeInTheDocument();
    expect(screen.getAllByText("Nenhum lead").length).toBeGreaterThan(0);
  });

  it("renders dense lead context inside the correct stage", () => {
    render(<PipelineBoard leads={[lead]} />);

    expect(screen.getByRole("link", { name: "Clínica Horizonte" })).toHaveAttribute("href", "/leads/lead-1");
    expect(screen.getByText("91")).toBeInTheDocument();
    expect(screen.getByText("Nicholas")).toBeInTheDocument();
    expect(screen.getByText("Mogi das Cruzes/SP")).toBeInTheDocument();
  });
});
