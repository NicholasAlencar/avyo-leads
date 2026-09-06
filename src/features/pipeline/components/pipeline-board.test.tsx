// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/features/leads/actions", () => ({ changeLeadStageAction: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import { PipelineBoard } from "./pipeline-board";

describe("PipelineBoard", () => {
  it("renders all stages and a real empty state", () => {
    render(<PipelineBoard leads={[]} />);
    expect(screen.getByRole("heading", { name: "Novo" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cliente" })).toBeInTheDocument();
    expect(screen.getAllByText("Nenhum lead").length).toBeGreaterThan(0);
  });
});
