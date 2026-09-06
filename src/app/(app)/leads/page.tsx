import Link from "next/link";
import { Plus } from "@/components/ui/icons";
import { PageHeading } from "@/components/ui/primitives";
import { requireMember } from "@/features/auth/require-member";
import { LeadFiltersForm } from "@/features/leads/components/lead-filters";
import { LeadTable } from "@/features/leads/components/lead-table";
import { listLeads } from "@/features/leads/repository";
import { parseLeadSearchParams, type LeadSearchParams } from "@/features/leads/search-params";

function pageHref(params: LeadSearchParams, page: number): string {
  const next = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) next.set(key, first);
  });
  next.set("page", String(page));
  return `/leads?${next.toString()}`;
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<LeadSearchParams> }) {
  const rawParams = await searchParams;
  const filters = parseLeadSearchParams(rawParams);
  const member = await requireMember();
  const { leads, total } = await listLeads(member, filters);
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

  return (
    <section className="mx-auto max-w-[1540px]">
      <PageHeading eyebrow="Operação comercial" title="Leads" description={`${total} empresa${total === 1 ? "" : "s"} na sua organização · priorize fit, contexto e próxima ação.`} actions={<Link className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-primary-hover)]" href="/leads/novo"><Plus className="size-4" />Adicionar lead</Link>} />

      <div className="mt-6"><LeadFiltersForm filters={filters} /></div><div className="mt-3"><LeadTable leads={leads} /></div>

      {total > 0 ? (
        <nav aria-label="Paginação de leads" className="mt-4 flex items-center justify-between text-sm text-[var(--text-secondary)]">
          <span>Página {Math.min(filters.page, totalPages)} de {totalPages}</span>
          <div className="flex gap-2">
            {filters.page > 1 ? <Link className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 font-semibold" href={pageHref(rawParams, filters.page - 1)}>Anterior</Link> : null}
            {filters.page < totalPages ? <Link className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 font-semibold" href={pageHref(rawParams, filters.page + 1)}>Próxima</Link> : null}
          </div>
        </nav>
      ) : null}
    </section>
  );
}
