// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoginForm, type LoginState } from "./login-form";

const idleState: LoginState = { status: "idle" };

async function idleAction(): Promise<LoginState> {
  return idleState;
}

describe("LoginForm", () => {
  it("blocks authentication when Supabase is not configured", () => {
    render(<LoginForm action={idleAction} configured={false} />);

    expect(screen.getByText("INTEGRAÇÃO NÃO CONFIGURADA")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeDisabled();
    expect(screen.getByLabelText("E-mail")).toBeDisabled();
    expect(screen.getByLabelText("Senha")).toBeDisabled();
  });

  it("enables credentials when Supabase is configured", () => {
    render(<LoginForm action={idleAction} configured />);

    expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled();
    expect(screen.queryByText("INTEGRAÇÃO NÃO CONFIGURADA")).not.toBeInTheDocument();
  });
});
