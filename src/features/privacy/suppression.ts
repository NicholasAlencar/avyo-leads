export type ContactChannel = "email" | "whatsapp" | "linkedin";

export interface ContactSuppression {
  scope: "company" | "channel" | "address";
  channel?: ContactChannel;
  address?: string;
  removedAt?: string | null;
}

export type ContactDecision = { allowed: true } | { allowed: false; reason: string };

function normalizedAddress(address: string | undefined): string | undefined {
  return address?.trim().toLowerCase() || undefined;
}

export function isContactAllowed(
  lead: { optedOutAt: string | null },
  suppressions: ContactSuppression[],
  channel: ContactChannel,
  address?: string,
): ContactDecision {
  const active = suppressions.filter((suppression) => !suppression.removedAt);

  if (lead.optedOutAt || active.some((suppression) => suppression.scope === "company")) {
    return { allowed: false, reason: "Contato bloqueado por opt-out da empresa." };
  }

  if (
    active.some(
      (suppression) => suppression.scope === "channel" && suppression.channel === channel,
    )
  ) {
    return { allowed: false, reason: "Este canal está bloqueado para contato." };
  }

  const targetAddress = normalizedAddress(address);
  if (
    targetAddress &&
    active.some(
      (suppression) =>
        suppression.scope === "address" &&
        suppression.channel === channel &&
        normalizedAddress(suppression.address) === targetAddress,
    )
  ) {
    return { allowed: false, reason: "Este endereço está bloqueado para contato." };
  }

  return { allowed: true };
}
