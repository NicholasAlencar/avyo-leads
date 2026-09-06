import Link from "next/link";
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
    <section className="mx-auto max-w-[1600px]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">CRM interno</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Leads</h1>
          <p className="mt-2 text-sm text-slate-600">{total} empresa{total === 1 ? "" : "s"} na sua organização</p>
        </div>
        <Link className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800" href="/leads/novo">Adicionar lead</Link>
      </div>

      <div className="mt-6"><LeadFiltersForm filters={filters} /></div>
      <div className="mt-4"><LeadTable leads={leads} /></div>

      {total > 0 ? (
        <nav aria-label="Paginação de leads" className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>Página {Math.min(filters.page, totalPages)} de {totalPages}</span>
          <div className="flex gap-2">
            {filters.page > 1 ? <Link className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold" href={pageHref(rawParams, filters.page - 1)}>Anterior</Link> : null}
            {filters.page < totalPages ? <Link className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold" href={pageHref(rawParams, filters.page + 1)}>Próxima</Link> : null}
          </div>
        </nav>
      ) : null}
    </section>
  );
}
