import Link from "next/link";
import { CalendarClock } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/primitives";
import { LeadScoreBadge } from "@/features/leads/components/lead-score-badge";
import type { LeadSummary } from "@/features/leads/types";
import { StageControl } from "./stage-control";

export function PipelineLeadCard({ lead }: { lead: LeadSummary }) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,.03)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link className="block truncate text-sm font-semibold text-[var(--text-primary)] hover:text-blue-700" href={`/leads/${lead.id}`}>{lead.companyName}</Link><p className="mt-1 truncate text-[11px] text-[var(--text-secondary)]">{lead.segment ?? "Segmento não informado"}</p></div><LeadScoreBadge score={lead.score} /></div>
      <p className="mt-3 text-xs text-[var(--text-secondary)]">{[lead.city, lead.stateCode].filter(Boolean).join("/") || "Local não informado"}</p>
      {lead.opportunityReason ? <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-[var(--text-secondary)]">{lead.opportunityReason}</p> : null}
      <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3"><span className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">{lead.ownerName ? <><Avatar className="size-6 rounded-lg text-[8px]" name={lead.ownerName} />{lead.ownerName}</> : "Não atribuído"}</span><span className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]"><CalendarClock className="size-3" />{lead.lastActivityAt ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(lead.lastActivityAt)) : "Sem atividade"}</span></div>
      <details className="group mt-2"><summary className="cursor-pointer list-none rounded-lg py-1.5 text-center text-[11px] font-semibold text-blue-700 hover:bg-blue-50 marker:hidden">Mover etapa</summary><StageControl leadId={lead.id} stage={lead.pipelineStage} /></details>
    </article>
  );
}
