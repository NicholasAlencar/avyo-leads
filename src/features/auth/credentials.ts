import { z } from "zod";

const loginCredentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Informe um e-mail válido.")),
  password: z.string().min(1, "Informe sua senha."),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export function parseLoginCredentials(value: unknown): LoginCredentials {
  return loginCredentialsSchema.parse(value);
}
