export interface MutationFailure {
  ok: false;
  message: string;
}

export interface MutationSuccess<T> {
  ok: true;
  data: T;
}

export type MutationResult<T> = MutationSuccess<T> | MutationFailure;

interface DatabaseErrorLike {
  code?: string;
}

export function toSafeMutationMessage(error: unknown): string {
  const code = (error as DatabaseErrorLike | null)?.code;
  if (code === "RATE_LIMITED") return "Limite de gravações atingido. Aguarde um minuto.";

  if (code === "23505") {
    return "Esta empresa já possui um registro com o mesmo identificador público.";
  }
  if (code === "P0002") {
    return "Lead não encontrado.";
  }
  if (code === "40001") {
    return "O lead foi alterado por outra pessoa. Atualize a página e tente novamente.";
  }
  if (code === "42501") {
    return "Você não tem permissão para realizar esta ação.";
  }

  return "Não foi possível concluir a operação. Tente novamente.";
}
