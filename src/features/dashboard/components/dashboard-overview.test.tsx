// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DashboardData } from "../query";
import { DashboardOverview } from "./dashboard-overview";

const data: DashboardData = {
  counts: { found: 32, new: 10, qualified: 12, hot: 5, contacted: 8, replies: 4, positive: 3, meetings: 2, proposals: 1, clients: 1, potential: 180000, revenue: 24000 },
  segments: [{ segment: "Odontologia", found: 10, new: 2, qualified: 6, hot: 4, contacted: 5, replies: 3, positive: 2, meetings: 2, proposals: 1, clients: 1, potential: 80000, revenue: 24000 }],
  approach: [{ id: "lead-1", company_name: "Clínica Horizonte", score: 91, conclusion: "Operação multiunidade com sinais públicos de expansão.", reasons: ["Três unidades identificadas"] }],
};

describe("DashboardOverview", () => {
  it("renders a commercial command center using only real values", () => {
    render(<DashboardOverview data={data} days={30} />);

    expect(screen.getByRole("heading", { name: "Visão geral" })).toBeInTheDocument();
    expect(screen.getByText("R$ 180.000,00")).toBeInTheDocument();
    expect(screen.getByText("Clínica Horizonte")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir lead/i })).toHaveAttribute("href", "/leads/lead-1");
    expect(screen.queryByText(/desde o mês passado/i)).not.toBeInTheDocument();
  });

  it("renders an honest empty priority state", () => {
    render(<DashboardOverview data={{ ...data, approach: [] }} days={null} />);

    expect(screen.getByText("Nenhuma prioridade disponível")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Encontrar empresas" })).toHaveAttribute("href", "/encontrar");
  });
});
