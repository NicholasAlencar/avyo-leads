import { LoginForm } from "./login-form";
import { loginAction } from "@/features/auth/actions";
import { brand } from "@/lib/brand";
import { getPublicEnv } from "@/lib/env/public";

function hasValidSupabaseConfiguration(): boolean {
  try {
    const env = getPublicEnv();
    return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  } catch {
    return false;
  }
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  return (
    <main className="grid min-h-screen bg-slate-100 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden bg-slate-950 p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <p className="text-sm font-semibold tracking-[0.28em] text-cyan-300">VIO</p>
        <div className="max-w-xl">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-400">
            Inteligência comercial
          </p>
          <h1 className="mt-5 text-6xl font-semibold tracking-[-0.05em]">Menos volume. Mais fit.</h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-slate-300">
            Encontre contexto, sinais de oportunidade e o próximo passo comercial em uma única central.
          </p>
        </div>
        <p className="text-sm text-slate-500">Uso interno da equipe VIO</p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
          <p className="text-xs font-bold tracking-[0.24em] text-cyan-700">{brand.name}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Acesse sua operação</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">{brand.description}.</p>
          {reason === "membership" ? <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Esta conta não possui um vínculo ativo com a equipe. Solicite acesso ao administrador ou entre com outra conta.</p> : null}
          <LoginForm action={loginAction} configured={hasValidSupabaseConfiguration()} />
        </div>
      </section>
    </main>
  );
}
