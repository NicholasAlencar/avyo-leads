import { requireMember } from "@/features/auth/require-member";
import { listLeads } from "@/features/leads/repository";
import { PipelineBoard } from "@/features/pipeline/components/pipeline-board";

export default async function PipelinePage() {
  const member = await requireMember();
  const { leads, total } = await listLeads(member, { sort: "recent_desc", page: 1, pageSize: 100 });
  return (
    <section className="mx-auto max-w-[1800px]">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Fluxo comercial</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Pipeline</h1>
      <p className="mt-2 text-sm text-slate-600">{total > 100 ? `Exibindo os 100 leads mais recentes de ${total}.` : `${total} lead${total === 1 ? "" : "s"} no fluxo.`}</p>
      <div className="mt-7"><PipelineBoard leads={leads} /></div>
    </section>
  );
}
