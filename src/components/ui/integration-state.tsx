import type { ProviderStatus } from "@/lib/providers/provider";

interface IntegrationStateProps {
  status: ProviderStatus;
  isAdmin: boolean;
}

export function IntegrationState({ status, isAdmin }: IntegrationStateProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">{status.label}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {status.configured
              ? "Credenciais necessárias disponíveis no servidor."
              : "Este recurso permanece desativado até a configuração das credenciais."}
          </p>
        </div>
        <span
          className={
            status.configured
              ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-emerald-700"
              : "rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-800"
          }
        >
          {status.configured ? "CONFIGURADA" : "INTEGRAÇÃO NÃO CONFIGURADA"}
        </span>
      </div>

      {!status.configured && isAdmin && status.missing.length > 0 ? (
        <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-xs font-medium text-slate-500">Variáveis ausentes</p>
          <ul className="mt-1 space-y-1">
            {status.missing.map((variable) => (
              <li className="font-mono text-xs text-slate-700" key={variable}>
                {variable}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!status.configured ? (
        <button
          className="mt-4 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-400"
          disabled
          type="button"
        >
          Indisponível
        </button>
      ) : null}
    </article>
  );
}
