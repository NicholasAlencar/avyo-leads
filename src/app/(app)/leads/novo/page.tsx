import Link from "next/link";
import { LeadForm } from "@/features/leads/components/lead-form";
import { PageHeading } from "@/components/ui/primitives";

const allowedDefaults = ["companyName", "segment", "city", "stateCode", "phone", "websiteUrl", "googleMapsUrl", "googlePlaceId"];

export default async function NewLeadPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const defaults = Object.fromEntries(allowedDefaults.flatMap((key) => typeof params[key] === "string" ? [[key, params[key] as string]] : []));
  return (
    <section className="mx-auto max-w-5xl">
      <Link className="mb-6 inline-flex text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]" href="/leads">← Voltar para leads</Link>
      <PageHeading eyebrow="Novo registro" title="Adicionar lead" description="Registre somente informações empresariais públicas e verificáveis. Campos não conhecidos devem permanecer vazios." />
      <div className="mt-7"><LeadForm defaults={defaults} /></div>
    </section>
  );
}
