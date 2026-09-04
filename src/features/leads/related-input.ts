import { z } from "zod";

const noteSchema = z
  .string()
  .trim()
  .min(1, "Escreva uma nota.")
  .max(5_000, "A nota pode ter no máximo 5.000 caracteres.");

const relationIdSchema = z.uuid("Identificador inválido.");

export function parseNoteInput(value: unknown): string {
  return noteSchema.parse(value);
}

export function parseRelationId(value: unknown): string {
  return relationIdSchema.parse(value);
}
