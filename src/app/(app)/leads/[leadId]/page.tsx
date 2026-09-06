import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMember } from "@/features/auth/require-member";
import { LeadOverview } from "@/features/leads/components/lead-overview";
import { LeadRelations } from "@/features/leads/components/lead-relations";
import { LeadTimeline } from "@/features/leads/components/lead-timeline";
import { getLead } from "@/features/leads/repository";
import { getLeadWorkspace } from "@/features/leads/workspace-query";
import { pipelineLabels } from "@/features/pipeline/stages";
import { StageControl } from "@/features/pipeline/components/stage-control";
import { FollowupForm } from "@/features/followups/components/followup-form";
import { IntelligencePanel } from "@/features/intelligence/components";

export default async function LeadDetailPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  const member = await requireMember();
  const [lead, workspace] = await Promise.all([getLead(member, leadId), getLeadWorkspace(member, leadId)]);
  if (!lead) notFound();

  return (
    <section className="mx-auto max-w-[1500px]">
      <Link className="text-sm font-semibold text-slate-500 hover:text-slate-900" href="/leads">← Voltar para leads</Link>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Ficha consolidada</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{lead.companyName}</h1><p className="mt-2 text-sm text-slate-500">{pipelineLabels[lead.pipelineStage]}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-right"><p className="text-xs font-semibold text-slate-400">VIO Lead Score</p><p className="mt-1 text-2xl font-black text-slate-950">{lead.score === null ? "—" : `${lead.score}/100`}</p></div>
      </div>
      <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="space-y-5"><LeadOverview lead={lead} workspace={workspace} /><IntelligencePanel leadId={lead.id} factors={workspace.scoreFactors} messages={workspace.messages} research={workspace.research} /><LeadTimeline activities={workspace.activities} /></div><div className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-bold">Etapa comercial</h2><StageControl leadId={lead.id} stage={lead.pipelineStage} /></section><FollowupForm leadId={lead.id} members={workspace.members} defaultOwner={lead.ownerId ?? member.userId} /><LeadRelations lead={lead} workspace={workspace} /></div></div>
    </section>
  );
}
