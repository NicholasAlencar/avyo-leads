import { IntegrationState } from "@/components/ui/integration-state";
import { requireMember } from "@/features/auth/require-member";
import { getProviderStatuses } from "@/features/integrations/provider-status";

export default async function IntegrationsPage() {
  const member = await requireMember();
  const statuses = getProviderStatuses(process.env);

  return (
    <section className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Configurações
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Integrações</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Estado real dos serviços externos. Recursos sem credenciais permanecem bloqueados.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
          {statuses.filter((status) => status.configured).length} de {statuses.length} configuradas
        </span>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statuses.map((status) => (
          <IntegrationState
            isAdmin={member.role === "admin"}
            key={status.kind}
            status={status}
          />
        ))}
      </div>
    </section>
  );
}
