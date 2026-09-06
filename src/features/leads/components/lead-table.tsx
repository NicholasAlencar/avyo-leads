"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight } from "@/components/ui/icons";
import { Avatar, EmptyState } from "@/components/ui/primitives";
import { pipelineLabels } from "@/features/pipeline/stages";
import type { LeadSummary } from "../types";
import { ContactPresence } from "./contact-presence";
import { LeadScoreBadge } from "./lead-score-badge";

const stageClasses: Record<string, string> = { NEW: "bg-slate-100 text-slate-700", ANALYSIS: "bg-indigo-50 text-indigo-700", PRIORITY: "bg-red-50 text-red-700", CONTACT_PREPARED: "bg-violet-50 text-violet-700", CONTACTED: "bg-blue-50 text-blue-700", REPLIED: "bg-cyan-50 text-cyan-700", MEETING: "bg-amber-50 text-amber-800", PROPOSAL: "bg-orange-50 text-orange-700", NEGOTIATION: "bg-fuchsia-50 text-fuchsia-700", CLIENT: "bg-emerald-50 text-emerald-700", LOST: "bg-slate-200 text-slate-600" };

export function LeadTable({ leads }: { leads: LeadSummary[] }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const allSelected = leads.length > 0 && leads.every((lead) => selected.has(lead.id));
  const selectedCount = useMemo(() => leads.reduce((count, lead) => count + Number(selected.has(lead.id)), 0), [leads, selected]);
  const toggle = (id: string) => setSelected((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const toggleAll = () => setSelected((current) => { const next = new Set(current); leads.forEach((lead) => allSelected ? next.delete(lead.id) : next.add(lead.id)); return next; });

  if (!leads.length) return <div className="rounded-[var(--radius-panel)] border border-dashed border-[var(--border-strong)] bg-white"><EmptyState actionHref="/leads/novo" actionLabel="Adicionar primeiro lead" title="Nenhum lead encontrado" description="Ajuste os filtros ou registre uma empresa com informações públicas verificadas." /></div>;

  return (
    <div className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
      <div className="flex h-12 items-center justify-between border-b border-[var(--border)] px-4 text-xs text-[var(--text-secondary)]"><span>{selectedCount ? <strong className="font-semibold text-blue-700">{selectedCount} selecionado{selectedCount > 1 ? "s" : ""}</strong> : `${leads.length} nesta página`}</span><span className="hidden sm:inline">Clique na empresa para abrir a inteligência do lead</span></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-subtle)] text-[10px] uppercase tracking-[.09em] text-[var(--text-tertiary)]"><tr><th className="w-12 px-4 py-3"><input aria-label="Selecionar todos os leads visíveis" checked={allSelected} className="size-4 accent-blue-600" onChange={toggleAll} type="checkbox" /></th><th className="px-3 py-3 font-semibold"><Link href="?sort=company_desc">Empresa</Link></th><th className="px-3 py-3 font-semibold"><Link href="?sort=score_desc">Fit</Link></th><th className="px-3 py-3 font-semibold">Canais</th><th className="min-w-64 px-3 py-3 font-semibold">Sinal de oportunidade</th><th className="px-3 py-3 font-semibold">Responsável</th><th className="px-3 py-3 font-semibold">Etapa</th><th className="px-3 py-3 font-semibold"><Link href="?sort=recent_desc">Última atividade</Link></th><th className="w-12 px-3 py-3" /></tr></thead>
          <tbody className="divide-y divide-[var(--border)]">{leads.map((lead) => <tr className="group hover:bg-blue-50/35" key={lead.id}><td className="px-4 py-4"><input aria-label={`Selecionar ${lead.companyName}`} checked={selected.has(lead.id)} className="size-4 accent-blue-600" onChange={() => toggle(lead.id)} type="checkbox" /></td><td className="sticky left-0 z-10 min-w-56 bg-white px-3 py-4 group-hover:bg-[#f5f8ff]"><Link className="font-semibold text-[var(--text-primary)] hover:text-blue-700" href={`/leads/${lead.id}`}>{lead.companyName}</Link><p className="mt-1 text-xs text-[var(--text-secondary)]">{lead.segment ?? "Segmento não informado"} · {[lead.city, lead.stateCode].filter(Boolean).join("/") || "Local não informado"}</p><p className="mt-1 text-[11px] text-[var(--text-tertiary)]">{lead.phone ?? lead.email ?? "Contato principal não informado"}</p></td><td className="px-3 py-4"><LeadScoreBadge score={lead.score} /></td><td className="px-3 py-4"><ContactPresence phone={lead.phone} email={lead.email} website={lead.websiteUrl} instagram={lead.instagramUrl} linkedin={lead.linkedinUrl} /></td><td className="px-3 py-4 text-xs leading-5 text-[var(--text-secondary)]">{lead.opportunityReason ?? "Ainda não analisado"}</td><td className="px-3 py-4">{lead.ownerName ? <div className="flex items-center gap-2"><Avatar className="size-7 rounded-lg text-[9px]" name={lead.ownerName} /><span className="text-xs font-medium">{lead.ownerName}</span></div> : <span className="text-xs text-[var(--text-tertiary)]">Não atribuído</span>}</td><td className="px-3 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${stageClasses[lead.pipelineStage]}`}>{pipelineLabels[lead.pipelineStage]}</span></td><td className="whitespace-nowrap px-3 py-4 text-xs text-[var(--text-secondary)]">{lead.lastActivityAt ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(lead.lastActivityAt)) : "Sem atividade"}</td><td className="px-3 py-4"><Link aria-label={`Abrir ${lead.companyName}`} className="grid size-8 place-items-center rounded-lg text-[var(--text-tertiary)] hover:bg-white hover:text-blue-700 hover:shadow-sm" href={`/leads/${lead.id}`}><ChevronRight className="size-4" /></Link></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
