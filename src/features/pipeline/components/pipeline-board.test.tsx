// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PipelineBoard } from "./pipeline-board";

describe("PipelineBoard", () => {
  it("renders all stages and a real empty state", () => {
    render(<PipelineBoard leads={[]} />);
    expect(screen.getByRole("heading", { name: "Novo" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cliente" })).toBeInTheDocument();
    expect(screen.getAllByText("Nenhum lead").length).toBeGreaterThan(0);
  });
});
