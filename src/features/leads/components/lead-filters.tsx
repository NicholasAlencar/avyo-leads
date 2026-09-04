import Link from "next/link";
import { pipelineLabels, pipelineStages } from "@/features/pipeline/stages";
import type { LeadFilters } from "../types";

export function LeadFiltersForm({ filters }: { filters: LeadFilters }) {
  return (
    <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-7" method="get">
      <label className="xl:col-span-2">
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Buscar empresa</span>
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
          defaultValue={filters.query}
          maxLength={120}
          name="q"
          placeholder="Nome da empresa"
        />
      </label>
      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Status</span>
        <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={filters.stage ?? ""} name="stage">
          <option value="">Todos</option>
          {pipelineStages.map((stage) => <option key={stage} value={stage}>{pipelineLabels[stage]}</option>)}
        </select>
      </label>
      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">UF</span>
        <input className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm uppercase" defaultValue={filters.stateCode} maxLength={2} name="state" placeholder="SP" />
      </label>
      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Cidade</span>
        <input className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={filters.city} name="city" />
      </label>
      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Segmento</span>
        <input className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={filters.segment} name="segment" />
      </label>
      <label>
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Ordenar por</span>
        <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" defaultValue={filters.sort} name="sort">
          <option value="score_desc">Maior score</option>
          <option value="opportunity_desc">Maior oportunidade</option>
          <option value="company_desc">Maior empresa</option>
          <option value="recent_desc">Mais recente</option>
          <option value="digital_desc">Presença digital</option>
        </select>
      </label>
      <div className="flex items-end gap-2 xl:col-start-6 xl:col-span-2">
        <button className="flex-1 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800" type="submit">Aplicar filtros</button>
        <Link className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" href="/leads">Limpar</Link>
      </div>
    </form>
  );
}
