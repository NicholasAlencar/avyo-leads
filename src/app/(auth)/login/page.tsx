import { LoginForm } from "./login-form";
import { loginAction } from "@/features/auth/actions";
import { brand } from "@/lib/brand";
import { getPublicEnv } from "@/lib/env/public";
import { AvyoLogo } from "@/components/ui/avyo-logo";
import { Check, Gauge, Sparkles } from "@/components/ui/icons";

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
    <main className="grid min-h-screen bg-[#f5f7fb] lg:grid-cols-[1.06fr_0.94fr]">
      <section className="avyo-grid relative hidden overflow-hidden bg-[var(--avyo-midnight)] p-14 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -left-28 -top-36 size-[520px] rounded-full bg-blue-600/25 blur-[110px]" /><div className="absolute -bottom-40 right-0 size-[500px] rounded-full bg-cyan-400/10 blur-[120px]" />
        <AvyoLogo className="relative z-10 h-auto w-44 object-contain" variant="light" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-cyan-300">Inteligência comercial interna</p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.055em] xl:text-6xl">Contexto para decidir.<br/><span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Precisão para vender.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-slate-300 xl:text-lg">Transforme sinais públicos em oportunidades priorizadas, argumentos claros e abordagens que fazem sentido para cada empresa.</p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[{ icon: Gauge, label: "Score explicável" }, { icon: Sparkles, label: "Contexto comercial" }, { icon: Check, label: "Próxima ação" }].map(({ icon: Icon, label }) => <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4 backdrop-blur-sm" key={label}><Icon className="size-4 text-cyan-300" /><p className="mt-3 text-xs font-semibold text-slate-200">{label}</p></div>)}
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md rounded-[28px] border border-white bg-white p-8 shadow-[var(--avyo-shadow)] sm:p-10">
          <div className="lg:hidden"><AvyoLogo className="h-auto w-40 object-contain" variant="dark" /></div><p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 lg:mt-0">{brand.name}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-.04em] text-slate-950">Acesse seu workspace</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">{brand.description}.</p>
          {reason === "membership" ? <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Esta conta não possui um vínculo ativo com a equipe. Solicite acesso ao administrador ou entre com outra conta.</p> : null}
          <LoginForm action={loginAction} configured={hasValidSupabaseConfiguration()} />
        </div>
      </section>
    </main>
  );
}
