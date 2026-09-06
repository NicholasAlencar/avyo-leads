import type { LeadSummary } from "@/features/leads/types";
import { pipelineLabels, type PipelineStage } from "../stages";
import { PipelineLeadCard } from "./pipeline-lead-card";

const accents: Record<PipelineStage, string> = { NEW: "bg-slate-400", ANALYZING: "bg-indigo-500", PRIORITY: "bg-red-500", CONTACT_PREPARED: "bg-violet-500", CONTACTED: "bg-blue-500", RESPONDED: "bg-cyan-500", MEETING_SCHEDULED: "bg-amber-500", PROPOSAL: "bg-orange-500", NEGOTIATION: "bg-fuchsia-500", CLIENT: "bg-emerald-500", LOST: "bg-slate-500" };

export function PipelineColumn({ stage, leads }: { stage: PipelineStage; leads: LeadSummary[] }) {
  return <section className="w-[292px] shrink-0"><div className="mb-3 flex items-center gap-2 px-1"><span className={`size-2 rounded-full ${accents[stage]}`} /><h2 className="text-xs font-semibold uppercase tracking-[.06em] text-[var(--text-primary)]">{pipelineLabels[stage]}</h2><span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)] ring-1 ring-[var(--border)]">{leads.length}</span></div><div className="min-h-40 space-y-2.5 rounded-[18px] border border-[var(--border)] bg-[#eef1f6] p-2.5">{leads.length ? leads.map((lead) => <PipelineLeadCard key={lead.id} lead={lead} />) : <p className="rounded-xl border border-dashed border-slate-300 bg-white/50 px-3 py-8 text-center text-xs text-[var(--text-tertiary)]">Nenhum lead</p>}</div></section>;
}
