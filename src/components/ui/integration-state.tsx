import type { ProviderStatus } from "@/lib/providers/provider";
import { Check, Settings2 } from "@/components/ui/icons";

interface IntegrationStateProps {
  status: ProviderStatus;
  isAdmin: boolean;
}

export function IntegrationState({ status, isAdmin }: IntegrationStateProps) {
  return (
    <article aria-label={status.label} className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]" data-state={status.configured ? "configured" : "unconfigured"}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${status.configured ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-700"}`}>{status.configured ? <Check className="size-5" /> : <Settings2 className="size-5" />}</span><div>
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{status.label}</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
            {status.configured
              ? "Credenciais necessárias disponíveis no servidor."
              : "Este recurso permanece desativado até a configuração das credenciais."}
          </p></div></div>
        <span
          className={
            status.configured
              ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-emerald-700"
              : "rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-800"
          }
        >
          {status.configured ? "CONFIGURADA" : "INTEGRAÇÃO NÃO CONFIGURADA"}
        </span>
      </div>

      {!status.configured && isAdmin && status.missing.length > 0 ? (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2.5">
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
