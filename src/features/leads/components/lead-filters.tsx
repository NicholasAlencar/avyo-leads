import Link from "next/link";
import { Filter, Search } from "@/components/ui/icons";
import { pipelineLabels, pipelineStages } from "@/features/pipeline/stages";
import type { LeadFilters } from "../types";

export function LeadFiltersForm({ filters }: { filters: LeadFilters }) {
  return (
    <form className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-card)]" method="get">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_1fr_.55fr_1fr_1fr_1fr_auto]">
      <label className="relative">
        <span className="sr-only">Buscar empresa</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] pl-9 pr-3 text-sm outline-none focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          defaultValue={filters.query}
          maxLength={120}
          name="q"
          placeholder="Buscar empresa..."
        />
      </label>
      <label>
        <span className="sr-only">Status</span>
        <select aria-label="Status" className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm" defaultValue={filters.stage ?? ""} name="stage">
          <option value="">Todos</option>
          {pipelineStages.map((stage) => <option key={stage} value={stage}>{pipelineLabels[stage]}</option>)}
        </select>
      </label>
      <label>
        <span className="sr-only">UF</span>
        <input aria-label="UF" className="h-10 w-full rounded-xl border border-[var(--border)] px-3 text-sm uppercase" defaultValue={filters.stateCode} maxLength={2} name="state" placeholder="UF" />
      </label>
      <label>
        <span className="sr-only">Cidade</span>
        <input aria-label="Cidade" className="h-10 w-full rounded-xl border border-[var(--border)] px-3 text-sm" defaultValue={filters.city} name="city" placeholder="Cidade" />
      </label>
      <label>
        <span className="sr-only">Segmento</span>
        <input aria-label="Segmento" className="h-10 w-full rounded-xl border border-[var(--border)] px-3 text-sm" defaultValue={filters.segment} name="segment" placeholder="Segmento" />
      </label>
      <label>
        <span className="sr-only">Ordenar por</span>
        <select aria-label="Ordenar por" className="h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm" defaultValue={filters.sort} name="sort">
          <option value="score_desc">Maior score</option>
          <option value="opportunity_desc">Maior oportunidade</option>
          <option value="company_desc">Maior empresa</option>
          <option value="recent_desc">Mais recente</option>
          <option value="digital_desc">Presença digital</option>
        </select>
      </label>
      <div className="flex gap-2">
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--brand-navy)] px-4 text-sm font-semibold text-white hover:bg-slate-800" type="submit"><Filter className="size-4" />Filtrar</button>
        <Link className="inline-flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]" href="/leads">Limpar</Link>
      </div>
      </div>
    </form>
  );
}
