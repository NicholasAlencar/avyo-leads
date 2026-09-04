export interface LoginState {
  status: "idle" | "error";
  message?: string;
}

export const initialLoginState: LoginState = { status: "idle" };

function errorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }

  return typeof error.code === "string" ? error.code : undefined;
}

export function mapAuthError(error: unknown): string {
  switch (errorCode(error)) {
    case "invalid_credentials":
      return "E-mail ou senha inválidos.";
    case "not_configured":
      return "Integração não configurada.";
    default:
      return "Não foi possível entrar. Tente novamente.";
  }
}
