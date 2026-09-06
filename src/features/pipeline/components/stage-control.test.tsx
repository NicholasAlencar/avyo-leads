// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
const { mutate, refresh } = vi.hoisted(() => ({ mutate: vi.fn(), refresh: vi.fn() }));
vi.mock("@/features/leads/actions", () => ({ changeLeadStageAction: mutate }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
import { StageControl } from "./stage-control";
beforeEach(() => { vi.clearAllMocks(); });
describe("pipeline movement", () => {
  it("sends expected stage, then refreshes only on successful persistence", async () => {
    mutate.mockResolvedValue({ ok: true, data: null });
    render(<StageControl leadId="lead" stage="NEW" />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "ANALYZING" } });
    fireEvent.click(screen.getByRole("button", { name: "Mover lead" }));
    await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    expect(mutate).toHaveBeenCalledWith({ leadId: "lead", from: "NEW", to: "ANALYZING", confirmed: false });
  });
  it("preserves selection and reports a persistence conflict", async () => {
    mutate.mockResolvedValue({ ok: false, message: "Registro alterado por outra pessoa." });
    render(<StageControl leadId="lead" stage="NEW" />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "PRIORITY" } });
    fireEvent.click(screen.getByRole("button", { name: "Mover lead" }));
    expect(await screen.findByText("Registro alterado por outra pessoa.")).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox")).toHaveValue("PRIORITY");
  });
});
