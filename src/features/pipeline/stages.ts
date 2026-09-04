export const pipelineStages = [
  "NEW",
  "ANALYZING",
  "PRIORITY",
  "CONTACT_PREPARED",
  "CONTACTED",
  "RESPONDED",
  "MEETING_SCHEDULED",
  "PROPOSAL",
  "NEGOTIATION",
  "CLIENT",
  "LOST",
] as const;

export type PipelineStage = (typeof pipelineStages)[number];

export const pipelineLabels: Record<PipelineStage, string> = {
  NEW: "Novo",
  ANALYZING: "Em análise",
  PRIORITY: "Prioridade",
  CONTACT_PREPARED: "Contato preparado",
  CONTACTED: "Contato realizado",
  RESPONDED: "Respondeu",
  MEETING_SCHEDULED: "Reunião marcada",
  PROPOSAL: "Proposta",
  NEGOTIATION: "Negociação",
  CLIENT: "Cliente",
  LOST: "Perdido",
};
