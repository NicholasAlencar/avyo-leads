import { z } from "zod";
import type { LeadMutationInput } from "./types";

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
    z.string().max(max).optional(),
  );

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
  z.url({ error: "URL inválida." }).refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "Use uma URL HTTP ou HTTPS.").optional(),
);

const leadInputSchema = z.object({
  companyName: z.string().trim().min(2, "Informe o nome da empresa.").max(200),
  legalName: optionalText(200),
  tradingName: optionalText(200),
  segment: optionalText(120),
  category: optionalText(120),
  description: optionalText(4_000),
  cnpj: optionalText(24),
  stateCode: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim().toUpperCase() : undefined),
    z.string().regex(/^[A-Z]{2}$/, "UF deve conter duas letras.").optional(),
  ),
  city: optionalText(120),
  district: optionalText(120),
  addressLine: optionalText(300),
  postalCode: optionalText(16),
  phone: optionalText(32),
  whatsapp: optionalText(32),
  email: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() ? value.trim().toLowerCase() : undefined,
    z.email({ error: "E-mail inválido." }).optional(),
  ),
  websiteUrl: optionalUrl,
  instagramUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  googleMapsUrl: optionalUrl,
  googlePlaceId: optionalText(255),
  potentialValue: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().finite().min(0, "O valor potencial não pode ser negativo.").optional(),
  ),
});

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function digitsOnly(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/\D/g, "");
}

function normalizeDomain(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
}

export function parseLeadInput(value: unknown): LeadMutationInput {
  const parsed = leadInputSchema.parse(value);
  const normalizedCnpj = digitsOnly(parsed.cnpj);
  const normalizedPhone = digitsOnly(parsed.phone);

  if (normalizedCnpj && normalizedCnpj.length !== 14) {
    throw new Error("CNPJ deve conter 14 dígitos.");
  }

  if (normalizedPhone && (normalizedPhone.length < 10 || normalizedPhone.length > 15)) {
    throw new Error("Telefone deve conter entre 10 e 15 dígitos.");
  }

  return {
    ...parsed,
    normalizedName: normalizeName(parsed.companyName),
    normalizedCnpj,
    normalizedPhone,
    normalizedDomain: normalizeDomain(parsed.websiteUrl),
  };
}
