import { IntegrationState } from "@/components/ui/integration-state";
import { requireMember } from "@/features/auth/require-member";
import { getProviderStatuses } from "@/features/integrations/provider-status";
import { PageHeading } from "@/components/ui/primitives";

export default async function IntegrationsPage() {
  const member = await requireMember();
  const statuses = getProviderStatuses(process.env);

  return (
    <section className="mx-auto max-w-6xl">
      <PageHeading eyebrow="Configurações" title="Integrações" description="Estado real dos serviços externos. Recursos sem credenciais permanecem bloqueados." actions={<span className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
          {statuses.filter((status) => status.configured).length} de {statuses.length} configuradas
        </span>} />

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
