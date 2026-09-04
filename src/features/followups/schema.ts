import { z } from "zod";

const followupSchema = z.object({
  leadId: z.uuid("Lead inválido."),
  ownerId: z.uuid("Responsável inválido."),
  dueAt: z.string().refine(
    (value) => !Number.isNaN(Date.parse(value)) && /(Z|[+-]\d{2}:\d{2})$/.test(value),
    "Informe data e hora com fuso horário explícito.",
  ),
  cadenceName: z.string().trim().max(100).optional(),
  cadencePosition: z.coerce.number().int().min(0, "A posição da cadência não pode ser negativa."),
});

export type FollowupInput = z.infer<typeof followupSchema>;

export function parseFollowupInput(value: unknown): FollowupInput {
  return followupSchema.parse(value);
}
