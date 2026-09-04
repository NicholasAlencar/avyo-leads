import Link from "next/link";
import { pipelineLabels, pipelineStages } from "../stages";
import type { LeadSummary } from "@/features/leads/types";

export function PipelineBoard({ leads }: { leads: LeadSummary[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {pipelineStages.map((stage) => {
        const stageLeads = leads.filter((lead) => lead.pipelineStage === stage);
        return (
          <section className="w-72 shrink-0 rounded-2xl bg-slate-100 p-3" key={stage}>
            <div className="flex items-center justify-between px-1 py-2">
              <h2 className="text-sm font-bold text-slate-800">{pipelineLabels[stage]}</h2>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500">{stageLeads.length}</span>
            </div>
            <div className="mt-2 space-y-2">
              {stageLeads.length ? stageLeads.map((lead) => (
                <Link className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300" href={`/leads/${lead.id}`} key={lead.id}>
                  <p className="font-semibold text-slate-900">{lead.companyName}</p>
                  <p className="mt-1 text-xs text-slate-500">{lead.segment ?? "Segmento não informado"}</p>
                  <div className="mt-3 flex items-center justify-between text-xs"><span className="text-slate-400">{lead.city ?? "Sem cidade"}</span><span className="font-bold text-emerald-700">{lead.score === null ? "Sem score" : lead.score}</span></div>
                </Link>
              )) : <p className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">Nenhum lead</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
