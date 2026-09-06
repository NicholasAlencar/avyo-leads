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
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-slate-200/80 bg-white/85 px-5 backdrop-blur-xl lg:px-9">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          AVYO · VIO LEADS
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-800">
          Central de inteligência comercial
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">{member.name}</p>
          <p className="text-xs text-slate-500">{roleLabels[member.role]}</p>
        </div>
        <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-xs font-bold text-white shadow-lg shadow-blue-500/20">
          {initials || "V"}
        </span>
        <form action={logoutAction}>
          <button
            className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            type="submit"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
