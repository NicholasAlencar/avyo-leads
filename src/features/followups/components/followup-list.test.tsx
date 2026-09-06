// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FollowupRow } from "../query";
vi.mock("../actions", () => ({ finishFollowup: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import { FollowupList } from "./followup-list";

function row(id: string, dueAt: string): FollowupRow {
  return { id, lead_id: `lead-${id}`, owner_id: "owner", due_at: dueAt, status: "PENDING", cadence_name: null, cadence_position: 0, lead: { company_name: `Empresa ${id}` }, owner: { display_name: "Nicholas" } };
}

describe("FollowupList", () => {
  it("groups pending work by urgency", () => {
    render(<FollowupList now={new Date("2026-09-06T12:00:00-03:00")} rows={[row("atrasada", "2026-09-05T12:00:00-03:00"), row("hoje", "2026-09-06T16:00:00-03:00"), row("proxima", "2026-09-08T12:00:00-03:00")]} />);

    expect(screen.getByRole("heading", { name: "Atrasados" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hoje" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Próximos" })).toBeInTheDocument();
  });
});
