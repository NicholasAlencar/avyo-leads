"use client";

import { useActionState } from "react";
import { initialLoginState, type LoginState } from "@/features/auth/auth-result";

export type { LoginState } from "@/features/auth/auth-result";

export type LoginAction = (state: LoginState, formData: FormData) => Promise<LoginState>;

interface LoginFormProps {
  action: LoginAction;
  configured: boolean;
}

export function LoginForm({ action, configured }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, initialLoginState);
  const disabled = !configured || pending;

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {!configured ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          INTEGRAÇÃO NÃO CONFIGURADA
        </div>
      ) : null}

      {state.status === "error" && state.message ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="email">
          E-mail
        </label>
        <input
          autoComplete="email"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          disabled={disabled}
          id="email"
          name="email"
          required
          type="email"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700" htmlFor="password">
          Senha
        </label>
        <input
          autoComplete="current-password"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          disabled={disabled}
          id="password"
          name="password"
          required
          type="password"
        />
      </div>

      <button
        className="h-12 w-full rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={disabled}
        type="submit"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
