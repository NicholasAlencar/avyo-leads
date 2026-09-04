import { describe, expect, it } from "vitest";
import { isContactAllowed, type ContactSuppression } from "./suppression";

const lead = { optedOutAt: null };

describe("isContactAllowed", () => {
  it("blocks every channel for a company-wide opt-out", () => {
    expect(isContactAllowed(lead, [{ scope: "company" }], "email")).toEqual({
      allowed: false,
      reason: "Contato bloqueado por opt-out da empresa.",
    });
  });

  it("blocks only the matching channel", () => {
    const suppressions: ContactSuppression[] = [{ scope: "channel", channel: "whatsapp" }];

    expect(isContactAllowed(lead, suppressions, "whatsapp").allowed).toBe(false);
    expect(isContactAllowed(lead, suppressions, "email").allowed).toBe(true);
  });

  it("normalizes an address before applying an address-specific block", () => {
    const suppressions: ContactSuppression[] = [
      { scope: "address", channel: "email", address: "Contato@Empresa.com.br" },
    ];

    expect(isContactAllowed(lead, suppressions, "email", " contato@empresa.com.br ")).toEqual({
      allowed: false,
      reason: "Este endereço está bloqueado para contato.",
    });
  });

  it("ignores suppressions that were restored", () => {
    const suppressions: ContactSuppression[] = [
      { scope: "company", removedAt: "2026-09-03T12:00:00.000Z" },
    ];

    expect(isContactAllowed(lead, suppressions, "linkedin")).toEqual({ allowed: true });
  });

  it("honors the lead-level opt-out flag", () => {
    expect(
      isContactAllowed({ optedOutAt: "2026-09-03T12:00:00.000Z" }, [], "email"),
    ).toEqual({ allowed: false, reason: "Contato bloqueado por opt-out da empresa." });
  });
});
