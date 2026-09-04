import type { PipelineStage } from "./stages";

const allowedTransitions: Record<PipelineStage, readonly PipelineStage[]> = {
  NEW: ["ANALYZING", "PRIORITY", "LOST"],
  ANALYZING: ["NEW", "PRIORITY", "LOST"],
  PRIORITY: ["ANALYZING", "CONTACT_PREPARED", "LOST"],
  CONTACT_PREPARED: ["PRIORITY", "CONTACTED", "LOST"],
  CONTACTED: ["CONTACT_PREPARED", "RESPONDED", "LOST"],
  RESPONDED: ["CONTACTED", "MEETING_SCHEDULED", "LOST"],
  MEETING_SCHEDULED: ["RESPONDED", "PROPOSAL", "LOST"],
  PROPOSAL: ["MEETING_SCHEDULED", "NEGOTIATION", "LOST"],
  NEGOTIATION: ["PROPOSAL", "CLIENT", "LOST"],
  CLIENT: ["LOST"],
  LOST: ["ANALYZING", "PRIORITY"],
};

export function canTransition(from: PipelineStage, to: PipelineStage): boolean {
  return from !== to && allowedTransitions[from].includes(to);
}

export function validateStageChange(input: {
  from: PipelineStage;
  to: PipelineStage;
  confirmed: boolean;
}): void {
  if (input.from === input.to) {
    throw new Error("O lead já está neste estágio.");
  }

  if (!canTransition(input.from, input.to)) {
    throw new Error("Transição de pipeline não permitida.");
  }

  if (input.from === "CLIENT" && input.to === "LOST" && !input.confirmed) {
    throw new Error("Esta alteração exige confirmação explícita.");
  }
}

export function getAllowedTransitions(from: PipelineStage): readonly PipelineStage[] {
  return allowedTransitions[from];
}
