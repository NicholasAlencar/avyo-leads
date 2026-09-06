import { requireMember } from "@/features/auth/require-member";
import { listLeads } from "@/features/leads/repository";
import { PipelineBoard } from "@/features/pipeline/components/pipeline-board";
import { PageHeading, Surface } from "@/components/ui/primitives";

export default async function PipelinePage() {
  const member = await requireMember();
  const { leads, total } = await listLeads(member, { sort: "recent_desc", page: 1, pageSize: 100 });
  return (
    <section className="mx-auto max-w-[1800px]">
      <PageHeading eyebrow="Fluxo comercial" title="Pipeline" description={total > 100 ? `Exibindo os 100 leads mais recentes de ${total}.` : `${total} lead${total === 1 ? "" : "s"} no fluxo · acompanhe etapa, responsável e último movimento.`} />
      <Surface className="mt-6 overflow-hidden p-4"><div className="mb-4 flex flex-wrap items-center gap-5 border-b border-[var(--border)] pb-4 text-xs text-[var(--text-secondary)]"><span><strong className="text-base text-[var(--text-primary)]">{total}</strong> oportunidades</span><span><strong className="text-base text-[var(--text-primary)]">{leads.filter((lead) => lead.score !== null && lead.score >= 65).length}</strong> leads quentes</span><span className="ml-auto hidden text-[var(--text-tertiary)] md:block">Arraste horizontalmente para navegar por todas as etapas</span></div><PipelineBoard leads={leads} /></Surface>
    </section>
  );
}
