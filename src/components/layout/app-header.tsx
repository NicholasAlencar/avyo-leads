import { logoutAction } from "@/features/auth/actions";
import type { CurrentMember } from "@/features/auth/require-member";

interface AppHeaderProps {
  member: CurrentMember;
}

const roleLabels = {
  admin: "Administrador",
  manager: "Gestor",
  member: "Membro",
} as const;

export function AppHeader({ member }: AppHeaderProps) {
  const initials = member.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Ambiente interno
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-800">
          Priorize oportunidades com contexto real
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">{member.name}</p>
          <p className="text-xs text-slate-500">{roleLabels[member.role]}</p>
        </div>
        <span className="grid size-10 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
          {initials || "V"}
        </span>
        <form action={logoutAction}>
          <button
            className="rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            type="submit"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
