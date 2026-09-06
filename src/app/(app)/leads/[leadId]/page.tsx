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
import { ChevronRight } from "@/components/ui/icons";
import { Badge, PageHeading, Surface } from "@/components/ui/primitives";
import { LeadScoreBadge } from "@/features/leads/components/lead-score-badge";

export default async function LeadDetailPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  const member = await requireMember();
  const [lead, workspace] = await Promise.all([getLead(member, leadId), getLeadWorkspace(member, leadId)]);
  if (!lead) notFound();

  return (
    <section className="mx-auto max-w-[1480px]">
      <Link className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-blue-700" href="/leads">Leads <ChevronRight className="size-3.5" /> Ficha da empresa</Link>
      <div className="mt-4 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]"><PageHeading eyebrow="Inteligência do lead" title={lead.companyName} description={`${lead.segment ?? "Segmento não informado"} · ${[lead.city, lead.stateCode].filter(Boolean).join("/") || "Local não informado"}`} actions={<div className="flex items-center gap-3"><Badge tone="info">{pipelineLabels[lead.pipelineStage]}</Badge><LeadScoreBadge score={lead.score} /></div>} /></div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]"><div className="space-y-5"><LeadOverview lead={lead} workspace={workspace} /><IntelligencePanel leadId={lead.id} factors={workspace.scoreFactors} messages={workspace.messages} research={workspace.research} /><LeadTimeline activities={workspace.activities} /></div><div className="space-y-5 xl:sticky xl:top-[88px] xl:self-start"><Surface className="p-5"><h2 className="text-sm font-semibold">Etapa comercial</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">Avance somente quando a próxima ação estiver validada.</p><StageControl leadId={lead.id} stage={lead.pipelineStage} /></Surface><FollowupForm leadId={lead.id} members={workspace.members} defaultOwner={lead.ownerId ?? member.userId} /><LeadRelations lead={lead} workspace={workspace} /></div></div>
    </section>
  );
}
