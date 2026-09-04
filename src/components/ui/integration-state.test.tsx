// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IntegrationState } from "./integration-state";

describe("IntegrationState", () => {
  it("renders the exact unavailable state and missing variables for administrators", () => {
    render(
      <IntegrationState
        isAdmin
        status={{
          kind: "google_places",
          label: "Google Places / Maps",
          configured: false,
          missing: ["GOOGLE_MAPS_API_KEY"],
        }}
      />,
    );

    expect(screen.getByText("INTEGRAÇÃO NÃO CONFIGURADA")).toBeInTheDocument();
    expect(screen.getByText("GOOGLE_MAPS_API_KEY")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Indisponível" })).toBeDisabled();
  });

  it("hides secret variable names from non-administrators", () => {
    render(
      <IntegrationState
        isAdmin={false}
        status={{
          kind: "ai",
          label: "Inteligência artificial",
          configured: false,
          missing: ["OPENAI_API_KEY"],
        }}
      />,
    );

    expect(screen.queryByText("OPENAI_API_KEY")).not.toBeInTheDocument();
  });

  it("marks a fully configured provider as available", () => {
    render(
      <IntegrationState
        isAdmin
        status={{
          kind: "supabase",
          label: "Supabase",
          configured: true,
          missing: [],
        }}
      />,
    );

    expect(screen.getByText("CONFIGURADA")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
