import { pipelineStages } from "../stages";
import type { LeadSummary } from "@/features/leads/types";
import { PipelineColumn } from "./pipeline-column";

export function PipelineBoard({ leads }: { leads: LeadSummary[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-5">
      {pipelineStages.map((stage) => <PipelineColumn key={stage} leads={leads.filter((lead) => lead.pipelineStage === stage)} stage={stage} />)}
    </div>
  );
}
